import { useEffect, useMemo, useState } from 'react';
import ActionItemsHeader from '../components/actionItems/ActionItemsHeader';
import ActionItemsListView from '../components/actionItems/ActionItemsListView';
import ActionItemsMatrixView from '../components/actionItems/ActionItemsMatrixView';
import { groupActionItems } from '../components/actionItems/groupActionItems';
import { deleteActionItem, getProjectActionItems, getProjectMembers, updateActionItemStatus } from '../lib/api';
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
  const [showAllItems, setShowAllItems] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'success' | 'error'>('success');
  const storedProjectContext = getStoredProjectContext();
  const projectId = storedProjectContext?.projectId ?? '';
  const currentUserId = storedProjectContext?.userUuid ?? '';
  const projectContextErrorMessage = !projectId
    ? '프로젝트 정보를 확인할 수 없습니다. 프로젝트에 다시 접속해 주세요.'
    : !currentUserId
      ? '사용자 정보를 확인할 수 없습니다. 다시 접속한 뒤 시도해 주세요.'
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
      const assigneeIds = projectMembersResult.status === 'fulfilled'
        ? projectMembersResult.value.map((member) => member.id)
        : [];
      const projectActionItemsResult = await loadProjectActionItems({
        projectId,
        currentUserId,
        assigneeIds,
        shouldLoadAll: showAllItems,
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
        setActionItems(projectActionItemsResult.value.items.map(toActionItem));
        setMessageTone('success');
        setMessage(projectActionItemsResult.value.isFallback
          ? '일부 조회가 실패해 불러온 액션 아이템만 표시합니다.'
          : projectMembersResult.status === 'rejected'
            ? '담당자 목록을 불러오지 못했지만 액션 아이템은 표시합니다.'
          : '');
      } else {
        console.error('[ActionItems][ItemsLoadFailed]', {
          projectId,
          error: projectActionItemsResult.reason,
        });
        setActionItems([]);
        setMessageTone('error');
        setMessage('액션 아이템을 불러오지 못했습니다.');
      }

      setIsLoading(false);
    };

    void loadActionItems();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, projectId, showAllItems]);

  const visibleActionItems = useMemo(
    () => actionItems,
    [actionItems],
  );

  const statusGroups = useMemo(
    () => groupActionItems<ActionItemStatus>(visibleActionItems, 'status'),
    [visibleActionItems],
  );
  const priorityGroups = useMemo(
    () => groupActionItems<ActionItemPriority>(visibleActionItems, 'priority'),
    [visibleActionItems],
  );

  const handleAssigneeChange = (itemId: string, assigneeId: string) => {
    console.warn('[ActionItems][API] 담당자 변경 엔드포인트 없음', {
      itemId,
      assigneeId,
    });
    setMessageTone('error');
    setMessage('담당자 변경 API가 아직 없어 저장할 수 없습니다.');
  };

  const handleStatusChange = async (itemId: string, status: ActionItemStatus) => {
    const previousItems = actionItems;

    setActionItems((items) => items.map((item) => (item.id === itemId ? { ...item, status } : item)));
    setMessage('');

    try {
      const updatedItem = await updateActionItemStatus(itemId, { status });
      setActionItems((items) => items.map((item) => (item.id === itemId ? toActionItem(updatedItem) : item)));
    } catch (error) {
      console.error('[ActionItems][StatusUpdateFailed]', {
        itemId,
        status,
        error,
      });
      setActionItems(previousItems);
      setMessageTone('error');
      setMessage('액션 아이템 상태 변경에 실패했습니다.');
    }
  };

  const handleDeleteActionItem = async (itemId: string) => {
    const previousItems = actionItems;

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
      setMessageTone('error');
      setMessage('액션 아이템 삭제에 실패했습니다.');
    }
  };

  return (
    <main className="min-h-full bg-background px-6 py-8 text-foreground md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ActionItemsHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          users={users}
          currentUserId={currentUserId}
          showAllItems={showAllItems}
          onShowAllItemsChange={setShowAllItems}
        />

        {(message || projectContextErrorMessage) && (
          <p className={!projectContextErrorMessage && messageTone === 'success' ? 'text-sm text-emerald-500' : 'text-sm text-primary'}>
            {projectContextErrorMessage || message}
          </p>
        )}

        {isLoading && (
          <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
            액션 아이템을 불러오는 중입니다.
          </div>
        )}

        {!isLoading && actionItems.length === 0 ? (
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
          />
        ) : (
          <ActionItemsMatrixView
            groupedItems={priorityGroups}
            users={users}
            onAssigneeChange={handleAssigneeChange}
            onDelete={handleDeleteActionItem}
          />
        )}
      </div>
    </main>
  );
}

const loadProjectActionItems = async ({
  projectId,
  currentUserId,
  assigneeIds,
  shouldLoadAll,
}: {
  projectId: string;
  currentUserId: string;
  assigneeIds: string[];
  shouldLoadAll: boolean;
}) => {
  if (shouldLoadAll && assigneeIds.length > 0) {
    return loadProjectActionItemsByAssignees(projectId, assigneeIds);
  }

  const assigneeId = currentUserId || undefined;

  try {
    return {
      items: await getProjectActionItems(projectId, {
        assignee_id: assigneeId,
        sort: 'created_at_desc',
      }),
      isFallback: false,
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
        isFallback: true,
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

const loadProjectActionItemsByAssignees = async (projectId: string, assigneeIds: string[]) => {
  const actionItemResults = await Promise.allSettled(
    assigneeIds
      .filter(Boolean)
      .map(async (assigneeId) => {
        try {
          return await getProjectActionItems(projectId, {
            assignee_id: assigneeId,
            sort: 'created_at_desc',
          });
        } catch (error) {
          console.error('[ActionItems][AssigneeSortedLoadFailed]', {
            projectId,
            assigneeId,
            error,
          });

          return getProjectActionItems(projectId, { assignee_id: assigneeId });
        }
      }),
  );
  const fulfilledItems = actionItemResults.flatMap((result) =>
    result.status === 'fulfilled' ? result.value : [],
  );

  return {
    items: dedupeActionItems(fulfilledItems),
    isFallback: actionItemResults.some((result) => result.status === 'rejected'),
  };
};

const dedupeActionItems = (items: ActionItemResponse[]) => {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
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

export default ActionItems;
