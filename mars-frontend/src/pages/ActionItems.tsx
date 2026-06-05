import { useEffect, useMemo, useState } from 'react';
import ActionItemsHeader from '../components/actionItems/ActionItemsHeader';
import ActionItemsListView from '../components/actionItems/ActionItemsListView';
import ActionItemsMatrixView from '../components/actionItems/ActionItemsMatrixView';
import { groupActionItems } from '../components/actionItems/groupActionItems';
import { deleteActionItem, getProjectActionItems, getProjectMembers, updateActionItemAssignee, updateActionItemPriority, updateActionItemStatus } from '../lib/api';
import type { ActionItemResponse } from '../lib/api';
import { getStoredProjectContext } from '../lib/projectContext';
import type {
  ActionItem,
  ActionItemLevel,
  ActionItemPriority,
  ActionItemStatus,
  ActionItemsViewMode,
  User,
} from '../components/actionItems/types';

const priorityLevels: Record<
  ActionItemPriority,
  { urgency: ActionItemLevel; importance: ActionItemLevel }
> = {
  DO: { urgency: 'high', importance: 'high' },
  SCHEDULE: { urgency: 'low', importance: 'high' },
  DELEGATE: { urgency: 'high', importance: 'low' },
  DELETE: { urgency: 'low', importance: 'low' },
};

function ActionItems() {
  const [viewMode, setViewMode] = useState<ActionItemsViewMode>('리스트');
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showMyItems, setShowMyItems] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingItemIds, setDeletingItemIds] = useState<string[]>([]);
  const [actionItemOrderIds, setActionItemOrderIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const storedProjectContext = getStoredProjectContext();
  const projectId = storedProjectContext?.projectId ?? '';
  const currentUserId = storedProjectContext?.userUuid ?? '';
  const projectContextErrorMessage = !projectId
    ? '프로젝트 정보를 확인할 수 없습니다. 프로젝트에 다시 접속해 주세요.'
    : !currentUserId
      ? '사용자 정보를 확인할 수 없습니다. 다시 접속한 뒤 시도해 주세요.'
      : '';
  const actionItemOrderStorageKey = projectId && currentUserId
    ? `mars:action-item-order:${projectId}:${currentUserId}`
    : '';

  useEffect(() => {
    if (!projectId || !currentUserId) {
      return;
    }

    let isMounted = true;

    const loadActionItems = async () => {
      setIsLoading(true);
      setMessage('');

      const projectMembersResult = await getProjectMembers(projectId)
        .then((projectMembers) => ({ status: 'fulfilled' as const, value: projectMembers }))
        .catch((error: unknown) => ({ status: 'rejected' as const, reason: error }));
      const projectActionItemsResult = await loadProjectActionItems({
        projectId,
        currentUserId,
        shouldLoadMine: showMyItems,
      })
        .then((projectActionItems) => ({ status: 'fulfilled' as const, value: projectActionItems }))
        .catch((error: unknown) => ({ status: 'rejected' as const, reason: error }));

      if (!isMounted) {
        return;
      }

      if (projectMembersResult.status === 'fulfilled') {
        setUsers(projectMembersResult.value);
      } else {
        console.error('[ActionItems][MembersLoadFailed]', {
          projectId,
          error: projectMembersResult.reason,
        });
        setUsers([]);
      }

      if (projectActionItemsResult.status === 'fulfilled') {
        setActionItemOrderIds(readActionItemOrder(actionItemOrderStorageKey));
        setActionItems(projectActionItemsResult.value.items.map(toActionItem));
        setMessage(
          projectMembersResult.status === 'rejected'
            ? '담당자 목록을 불러오지 못했지만 액션 아이템은 표시합니다.'
            : '',
        );
      } else {
        console.error('[ActionItems][ItemsLoadFailed]', {
          projectId,
          error: projectActionItemsResult.reason,
        });
        setActionItems([]);
        setMessage('액션 아이템을 불러오지 못했습니다.');
      }

      setIsLoading(false);
    };

    void loadActionItems();

    return () => {
      isMounted = false;
    };
  }, [actionItemOrderStorageKey, currentUserId, projectId, showMyItems]);

  const visibleActionItems = useMemo(
    () => sortActionItemsByOrder(actionItems, actionItemOrderIds),
    [actionItems, actionItemOrderIds],
  );

  const statusGroups = useMemo(
    () => groupActionItems<ActionItemStatus>(visibleActionItems, 'status'),
    [visibleActionItems],
  );
  const activeActionItems = useMemo(
    () => visibleActionItems.filter((item) => item.status !== 'DONE'),
    [visibleActionItems],
  );
  const completedActionItems = useMemo(
    () => visibleActionItems.filter((item) => item.status === 'DONE'),
    [visibleActionItems],
  );
  const priorityGroups = useMemo(
    () => groupActionItems<ActionItemPriority>(activeActionItems, 'priority'),
    [activeActionItems],
  );
  const completedActionItemCount = useMemo(
    () => completedActionItems.length,
    [completedActionItems],
  );

  const handleAssigneeChange = async (itemId: string, assigneeId: string) => {
    const previousItems = actionItems;

    setActionItems((items) => items.map((item) => (item.id === itemId ? { ...item, assignee_id: assigneeId } : item)));
    setMessage('');

    try {
      const updatedItem = await updateActionItemAssignee(itemId, { assignee_id: assigneeId || null });
      setActionItems((items) => items.map((item) => (item.id === itemId ? toActionItem(updatedItem) : item)));
    } catch (error) {
      console.error('[ActionItems][AssigneeUpdateFailed]', {
        itemId,
        assigneeId,
        error,
      });
      setActionItems(previousItems);
      setMessage('담당자 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const moveActionItemOrder = (
    itemId: string,
    updatedItems: ActionItem[],
    destinationItems: ActionItem[],
    targetItemId?: string,
  ) => {
    setActionItemOrderIds((currentOrderIds) => {
      const nextOrderIds = getMovedActionItemOrder({
        currentOrderIds,
        updatedItems,
        destinationItems,
        itemId,
        targetItemId,
      });

      writeActionItemOrder(actionItemOrderStorageKey, nextOrderIds);

      return nextOrderIds;
    });
  };

  const handleStatusChange = async (
    itemId: string,
    status: ActionItemStatus,
    targetItemId?: string,
  ) => {
    const previousItems = actionItems;
    const previousOrderIds = actionItemOrderIds;
    const movingItem = previousItems.find((item) => item.id === itemId);

    if (!movingItem) {
      return;
    }

    const updatedItems = previousItems.map((item) => (item.id === itemId ? { ...item, status } : item));

    setActionItems(updatedItems);
    moveActionItemOrder(
      itemId,
      updatedItems,
      updatedItems.filter((item) => item.status === status),
      targetItemId,
    );
    setMessage('');

    try {
      if (movingItem.status !== status) {
        const updatedItem = await updateActionItemStatus(itemId, { status });
        setActionItems((items) => items.map((item) => (item.id === itemId ? toActionItem(updatedItem) : item)));
      }
    } catch (error) {
      console.error('[ActionItems][StatusUpdateFailed]', {
        itemId,
        status,
        error,
      });
      setActionItems(previousItems);
      setActionItemOrderIds(previousOrderIds);
      writeActionItemOrder(actionItemOrderStorageKey, previousOrderIds);
      setMessage('액션 아이템 상태 변경에 실패했습니다.');
    }
  };

  const handlePriorityChange = async (
    itemId: string,
    priority: ActionItemPriority,
    targetItemId?: string,
  ) => {
    const previousItems = actionItems;
    const previousOrderIds = actionItemOrderIds;
    const levels = priorityLevels[priority];
    const movingItem = previousItems.find((item) => item.id === itemId);

    if (!movingItem) {
      return;
    }
    const nextStatus = movingItem.status === 'DONE' ? 'TODO' : movingItem.status;

    const updatedItems = previousItems.map((item) => (
        item.id === itemId
          ? {
              ...item,
              priority,
              urgency: levels.urgency,
              importance: levels.importance,
              status: nextStatus,
            }
          : item
    ));

    setActionItems(updatedItems);
    moveActionItemOrder(
      itemId,
      updatedItems,
      updatedItems.filter((item) => item.status !== 'DONE' && item.priority === priority),
      targetItemId,
    );
    setMessage('');

    try {
      if (movingItem.status !== nextStatus) {
        await updateActionItemStatus(itemId, { status: nextStatus });
      }

      if (movingItem.priority !== priority) {
        await updateActionItemPriority(itemId, toApiPriorityPayload(priority));
      }
    } catch (error) {
      console.error('[ActionItems][PriorityUpdateFailed]', {
        itemId,
        priority,
        error,
      });
      setActionItems(previousItems);
      setActionItemOrderIds(previousOrderIds);
      writeActionItemOrder(actionItemOrderStorageKey, previousOrderIds);
      setMessage('우선순위 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDeleteActionItem = async (itemId: string) => {
    const previousItems = actionItems;

    if (deletingItemIds.includes(itemId)) {
      return;
    }

    setDeletingItemIds((itemIds) => [...itemIds, itemId]);
    setActionItems((items) => items.filter((item) => item.id !== itemId));
    setMessage('');

    try {
      await deleteActionItem(itemId);
    } catch (error) {
      console.error('[ActionItems][DeleteFailed]', {
        itemId,
        error,
      });
      setActionItems(previousItems);
      setMessage('액션 아이템 삭제에 실패했습니다.');
    } finally {
      setDeletingItemIds((itemIds) => itemIds.filter((id) => id !== itemId));
    }
  };

  return (
    <main className="min-h-full bg-background px-6 py-8 text-foreground md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ActionItemsHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          currentUserId={currentUserId}
          showMyItems={showMyItems}
          onShowMyItemsChange={setShowMyItems}
          totalCount={visibleActionItems.length}
          completedCount={completedActionItemCount}
        />

        {(message || projectContextErrorMessage) && (
          <p className="text-sm text-primary">
            {projectContextErrorMessage || message}
          </p>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
            액션 아이템을 불러오는 중입니다.
          </div>
        ) : actionItems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-secondary/40 p-10 text-center text-sm text-muted-foreground">
            아직 등록된 액션 아이템이 없습니다.
          </div>
        ) : viewMode === '리스트' ? (
          <ActionItemsListView
            groupedItems={statusGroups}
            users={users}
            onAssigneeChange={handleAssigneeChange}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteActionItem}
            deletingItemIds={deletingItemIds}
          />
        ) : (
          <ActionItemsMatrixView
            groupedItems={priorityGroups}
            completedItems={completedActionItems}
            users={users}
            onAssigneeChange={handleAssigneeChange}
            onPriorityChange={handlePriorityChange}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteActionItem}
            deletingItemIds={deletingItemIds}
          />
        )}
      </div>
    </main>
  );
}

const loadProjectActionItems = async ({
  projectId,
  currentUserId,
  shouldLoadMine,
}: {
  projectId: string;
  currentUserId: string;
  shouldLoadMine: boolean;
}) => {
  const assigneeId = shouldLoadMine ? currentUserId : undefined;

  try {
    return {
      items: await getProjectActionItems(projectId, {
        assignee_id: assigneeId,
        sort: 'created_at_desc',
      }),
    };
  } catch (error) {
    console.error('[ActionItems][SortedLoadFailed]', {
      projectId,
      assigneeId,
      error,
    });

    try {
      return {
        items: await getProjectActionItems(projectId, {
          assignee_id: assigneeId,
        }),
      };
    } catch (fallbackError) {
      console.error('[ActionItems][ProjectLoadFailed]', {
        projectId,
        assigneeId,
        error: fallbackError,
      });

      throw fallbackError;
    }
  }
};

const sortActionItemsByOrder = (items: ActionItem[], orderIds: string[]) => {
  const orderIndex = new Map(orderIds.map((id, index) => [id, index]));

  return [...items].sort((firstItem, secondItem) => {
    const firstIndex = orderIndex.get(firstItem.id);
    const secondIndex = orderIndex.get(secondItem.id);

    if (firstIndex !== undefined && secondIndex !== undefined) {
      return firstIndex - secondIndex;
    }

    if (firstIndex !== undefined) {
      return -1;
    }

    if (secondIndex !== undefined) {
      return 1;
    }

    return 0;
  });
};

const getMovedActionItemOrder = ({
  currentOrderIds,
  updatedItems,
  destinationItems,
  itemId,
  targetItemId,
}: {
  currentOrderIds: string[];
  updatedItems: ActionItem[];
  destinationItems: ActionItem[];
  itemId: string;
  targetItemId?: string;
}) => {
  const allItemIds = updatedItems.map((item) => item.id);
  const allItemIdSet = new Set(allItemIds);
  const baseOrderIds = [
    ...currentOrderIds.filter((id) => allItemIdSet.has(id) && id !== itemId),
    ...allItemIds.filter((id) => id !== itemId && !currentOrderIds.includes(id)),
  ];
  const orderedDestinationIds = sortActionItemsByOrder(
    destinationItems.filter((item) => item.id !== itemId),
    currentOrderIds,
  ).map((item) => item.id);
  const validTargetItemId = targetItemId && orderedDestinationIds.includes(targetItemId)
    ? targetItemId
    : undefined;

  if (validTargetItemId) {
    const targetIndex = baseOrderIds.indexOf(validTargetItemId);

    return [
      ...baseOrderIds.slice(0, targetIndex),
      itemId,
      ...baseOrderIds.slice(targetIndex),
    ];
  }

  const lastDestinationItemId = orderedDestinationIds.at(-1);

  if (!lastDestinationItemId) {
    return [...baseOrderIds, itemId];
  }

  const lastDestinationIndex = baseOrderIds.indexOf(lastDestinationItemId);

  return [
    ...baseOrderIds.slice(0, lastDestinationIndex + 1),
    itemId,
    ...baseOrderIds.slice(lastDestinationIndex + 1),
  ];
};

const readActionItemOrder = (storageKey: string) => {
  if (!storageKey) {
    return [];
  }

  try {
    const value = window.localStorage.getItem(storageKey);
    const parsedValue = value ? JSON.parse(value) : [];

    return Array.isArray(parsedValue)
      ? parsedValue.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
};

const writeActionItemOrder = (storageKey: string, orderIds: string[]) => {
  if (!storageKey) {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(orderIds));
};

const toActionItem = (item: ActionItemResponse): ActionItem => {
  const priority = toActionItemPriority(item.priority, item.importance, item.urgency);
  const levels = priorityLevels[priority];

  return {
    id: item.id,
    meeting_id: item.meeting_id ?? '',
    assignee_id: item.assignee_id ?? '',
    description: item.description ?? '',
    priority,
    urgency: levels.urgency,
    importance: levels.importance,
    status: toActionItemStatus(item.status),
    deadline: item.deadline ?? '',
    created_at: item.created_at ?? '',
  };
};

const toActionItemStatus = (status?: string | null): ActionItemStatus => {
  const normalizedStatus = status?.toUpperCase();

  if (normalizedStatus === 'TODO' || normalizedStatus === 'IN_PROGRESS' || normalizedStatus === 'DONE') {
    return normalizedStatus;
  }

  return 'TODO';
};

const toActionItemPriority = (
  priority?: number | null,
  importance?: number | null,
  urgency?: number | null,
): ActionItemPriority => {
  if (importance !== null && importance !== undefined && urgency !== null && urgency !== undefined) {
    if (importance >= 2 && urgency >= 2) {
      return 'DO';
    }

    if (importance >= 2) {
      return 'SCHEDULE';
    }

    if (urgency >= 2) {
      return 'DELEGATE';
    }

    return 'DELETE';
  }

  if (priority !== null && priority !== undefined) {
    if (priority >= 3) {
      return 'DO';
    }

    if (priority <= 1) {
      return 'DELETE';
    }
  }

  if ((importance ?? 0) >= 2 && (urgency ?? 0) >= 2) {
    return 'DO';
  }

  if ((importance ?? 0) >= 2) {
    return 'SCHEDULE';
  }

  if ((urgency ?? 0) >= 2) {
    return 'DELEGATE';
  }

  return 'DELETE';
};

const toApiPriorityPayload = (priority: ActionItemPriority) => {
  if (priority === 'DO') {
    return {
      priority: 3,
      importance: 2,
      urgency: 2,
    };
  }

  if (priority === 'SCHEDULE') {
    return {
      priority: 2,
      importance: 2,
      urgency: 1,
    };
  }

  if (priority === 'DELEGATE') {
    return {
      priority: 2,
      importance: 1,
      urgency: 2,
    };
  }

  return {
    priority: 1,
    importance: 1,
    urgency: 1,
  };
};

export default ActionItems;
