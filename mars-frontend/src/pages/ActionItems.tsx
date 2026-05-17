import { useMemo, useState } from 'react';
import ActionItemsHeader from '../components/actionItems/ActionItemsHeader';
import ActionItemsListView from '../components/actionItems/ActionItemsListView';
import ActionItemsMatrixView from '../components/actionItems/ActionItemsMatrixView';
import { actionItems as initialActionItems } from '../components/actionItems/actionItemsData';
import { groupActionItems } from '../components/actionItems/groupActionItems';
import { usersData } from '../components/actionItems/usersData';
import type {
  ActionItem,
  ActionItemLevel,
  ActionItemPriority,
  ActionItemStatus,
  ActionItemsViewMode,
  NewActionItemInput,
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

const currentUserId = usersData[0].id;

function ActionItems() {
  const [viewMode, setViewMode] = useState<ActionItemsViewMode>('리스트');
  const [actionItems, setActionItems] =
    useState<ActionItem[]>(initialActionItems);
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  const visibleActionItems = useMemo(
    () =>
      showOnlyMine
        ? actionItems.filter((item) => item.assignee_id === currentUserId)
        : actionItems,
    [actionItems, showOnlyMine],
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
    setActionItems((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, assignee_id: assigneeId } : item,
      ),
    );
  };

  const handleStatusChange = (itemId: string, status: ActionItemStatus) => {
    setActionItems((items) =>
      items.map((item) => (item.id === itemId ? { ...item, status } : item)),
    );
  };

  const handlePriorityChange = (
    itemId: string,
    priority: ActionItemPriority,
  ) => {
    setActionItems((items) =>
      items.map((item) =>
        item.id === itemId
          ? { ...item, priority, ...priorityLevels[priority] }
          : item,
      ),
    );
  };

  const handleCreateActionItem = (input: NewActionItemInput) => {
    const deadline = `${input.deadline}T23:59:59+09:00`;

    setActionItems((items) => [
      {
        id: crypto.randomUUID(),
        meeting_id: 'manual-action-item',
        assignee_id: input.assignee_id,
        description: input.description,
        priority: input.priority,
        ...priorityLevels[input.priority],
        status: input.status,
        deadline,
        created_at: new Date().toISOString(),
      },
      ...items,
    ]);
  };

  const handleDeleteActionItem = (itemId: string) => {
    setActionItems((items) => items.filter((item) => item.id !== itemId));
  };

  return (
    <main className="min-h-full bg-background px-6 py-8 text-foreground md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ActionItemsHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          users={usersData}
          currentUserId={currentUserId}
          showOnlyMine={showOnlyMine}
          onShowOnlyMineChange={setShowOnlyMine}
          onCreateActionItem={handleCreateActionItem}
        />

        {viewMode === '리스트' ? (
          <ActionItemsListView
            groupedItems={statusGroups}
            users={usersData}
            onAssigneeChange={handleAssigneeChange}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteActionItem}
          />
        ) : (
          <ActionItemsMatrixView
            groupedItems={priorityGroups}
            users={usersData}
            onAssigneeChange={handleAssigneeChange}
            onPriorityChange={handlePriorityChange}
            onDelete={handleDeleteActionItem}
          />
        )}
      </div>
    </main>
  );
}

export default ActionItems;
