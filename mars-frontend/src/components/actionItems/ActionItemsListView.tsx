import { useState, type DragEvent } from 'react';
import { statusColumns } from './actionItemConfig';
import ActionItemCard from './ActionItemCard';
import type { ActionItem, ActionItemStatus, User } from './types';

interface ActionItemsListViewProps {
  groupedItems: Record<ActionItemStatus, ActionItem[]>;
  users: User[];
  onAssigneeChange: (itemId: string, assigneeId: string) => void;
  onStatusChange: (itemId: string, status: ActionItemStatus) => void;
  onDelete: (itemId: string) => void;
}

function ActionItemsListView({
  groupedItems,
  users,
  onAssigneeChange,
  onStatusChange,
  onDelete,
}: ActionItemsListViewProps) {
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [activeDropStatus, setActiveDropStatus] =
    useState<ActionItemStatus | null>(null);
  const [isDoneOpen, setIsDoneOpen] = useState(false);

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
    status: ActionItemStatus,
  ) => {
    event.preventDefault();
    const itemId = event.dataTransfer.getData('text/plain');

    if (itemId) {
      onStatusChange(itemId, status);
    }

    setDraggingItemId(null);
    setActiveDropStatus(null);
  };

  return (
    <section className="grid gap-6 xl:grid-cols-3">
      {statusColumns.map((column) => {
        const items = groupedItems[column.key] ?? [];
        const Icon = column.icon;
        const isActiveDropZone = activeDropStatus === column.key;
        const isDoneColumn = column.key === 'DONE';
        const isCollapsed = isDoneColumn && !isDoneOpen;

        return (
          <div
            key={column.key}
            className={[
              'flex min-w-0 flex-col gap-5 rounded-lg transition',
              isActiveDropZone ? 'bg-primary/5 ring-2 ring-primary/30' : '',
            ].join(' ')}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setActiveDropStatus(column.key);
            }}
            onDragLeave={() => setActiveDropStatus(null)}
            onDrop={(event) => handleDrop(event, column.key)}
          >
            <div className="flex items-center gap-3">
              <Icon className={`h-6 w-6 ${column.accent}`} strokeWidth={2} />
              <h2 className="text-xl text-foreground">
                {column.title}{' '}
                <span className="text-lg text-muted-foreground">
                  ({items.length})
                </span>
              </h2>
              {isDoneColumn ? (
                <button
                  type="button"
                  className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
                  onClick={() => setIsDoneOpen((open) => !open)}
                >
                  {isDoneOpen ? '접기' : '펼치기'}
                </button>
              ) : null}
            </div>
            {isCollapsed ? (
              <div className="rounded-lg border border-dashed border-border bg-secondary/50 p-5 text-sm text-muted-foreground">
                완료된 업무 {items.length}개가 접혀 있습니다.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <ActionItemCard
                    key={item.id}
                    item={item}
                    users={users}
                    onAssigneeChange={onAssigneeChange}
                    onDelete={onDelete}
                    onDragStart={setDraggingItemId}
                    onDragEnd={() => {
                      setDraggingItemId(null);
                      setActiveDropStatus(null);
                    }}
                    isDragging={draggingItemId === item.id}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

export default ActionItemsListView;
