import { useState, type DragEvent } from 'react';
import { CircleHelp } from 'lucide-react';
import { matrixQuadrants } from './actionItemConfig';
import ActionItemCard from './ActionItemCard';
import type { ActionItem, ActionItemPriority, User } from './types';

interface ActionItemsMatrixViewProps {
  groupedItems: Record<ActionItemPriority, ActionItem[]>;
  users: User[];
  onAssigneeChange: (itemId: string, assigneeId: string) => void;
  onPriorityChange: (itemId: string, priority: ActionItemPriority) => void;
  onDelete: (itemId: string) => void;
}

function ActionItemsMatrixView({
  groupedItems,
  users,
  onAssigneeChange,
  onPriorityChange,
  onDelete,
}: ActionItemsMatrixViewProps) {
  const [openDescription, setOpenDescription] =
    useState<ActionItemPriority | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [activeDropPriority, setActiveDropPriority] =
    useState<ActionItemPriority | null>(null);

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
    priority: ActionItemPriority,
  ) => {
    event.preventDefault();
    const itemId = event.dataTransfer.getData('text/plain');

    if (itemId) {
      onPriorityChange(itemId, priority);
    }

    setDraggingItemId(null);
    setActiveDropPriority(null);
  };

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {matrixQuadrants.map((quadrant) => {
        const items = groupedItems[quadrant.key] ?? [];
        const isDescriptionOpen = openDescription === quadrant.key;
        const isActiveDropZone = activeDropPriority === quadrant.key;

        return (
          <div
            key={quadrant.key}
            className={[
              `min-h-[320px] rounded-lg border ${quadrant.marker} bg-secondary p-5 transition`,
              isActiveDropZone ? 'bg-primary/5 ring-2 ring-primary/30' : '',
            ].join(' ')}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setActiveDropPriority(quadrant.key);
            }}
            onDragLeave={() => setActiveDropPriority(null)}
            onDrop={(event) => handleDrop(event, quadrant.key)}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl text-foreground">{quadrant.title}</h2>
                  <span className="relative flex items-center">
                    <button
                      type="button"
                      aria-label={`${quadrant.title} 설명 보기`}
                      aria-expanded={isDescriptionOpen}
                      className={[
                        'flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition',
                        isDescriptionOpen
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted hover:text-foreground',
                      ].join(' ')}
                      onClick={() =>
                        setOpenDescription(isDescriptionOpen ? null : quadrant.key)
                      }
                    >
                      <CircleHelp className="h-4 w-4" />
                    </button>
                    {isDescriptionOpen ? (
                      <span className="absolute left-8 top-1/2 z-10 w-max max-w-[520px] -translate-y-1/2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-lg whitespace-pre-line">
                        {quadrant.subtitle}
                      </span>
                    ) : null}
                  </span>
                </div>
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <ActionItemCard
                  key={item.id}
                  item={item}
                  users={users}
                  onAssigneeChange={onAssigneeChange}
                  onDelete={onDelete}
                  canChangeAssignee
                  onDragStart={setDraggingItemId}
                  onDragEnd={() => {
                    setDraggingItemId(null);
                    setActiveDropPriority(null);
                  }}
                  isDragging={draggingItemId === item.id}
                  compact
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default ActionItemsMatrixView;
