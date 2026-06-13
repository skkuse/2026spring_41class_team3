import { useState, type DragEvent } from 'react';
import { CheckCircle2, CircleHelp } from 'lucide-react';
import { typography } from '../../lib/typography';
import { matrixQuadrants } from './actionItemConfig';
import ActionItemCard from './ActionItemCard';
import type { ActionItem, ActionItemPriority, ActionItemStatus, User } from './types';

interface ActionItemsMatrixViewProps {
  groupedItems: Record<ActionItemPriority, ActionItem[]>;
  completedItems: ActionItem[];
  users: User[];
  onAssigneeChange: (itemId: string, assigneeId: string) => void;
  onPriorityChange: (itemId: string, priority: ActionItemPriority, targetItemId?: string) => void;
  onStatusChange: (itemId: string, status: ActionItemStatus, targetItemId?: string) => void;
  onDelete: (itemId: string) => void;
  deletingItemIds?: string[];
}

function ActionItemsMatrixView({
  groupedItems,
  completedItems,
  users,
  onAssigneeChange,
  onPriorityChange,
  onStatusChange,
  onDelete,
  deletingItemIds = [],
}: ActionItemsMatrixViewProps) {
  const [openDescription, setOpenDescription] =
    useState<ActionItemPriority | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [activeDropPriority, setActiveDropPriority] =
    useState<ActionItemPriority | null>(null);
  const [isDoneDropActive, setIsDoneDropActive] = useState(false);
  const [isDoneOpen, setIsDoneOpen] = useState(false);

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
    priority: ActionItemPriority,
    targetItemId?: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const itemId = event.dataTransfer.getData('text/plain');

    if (itemId && itemId !== targetItemId) {
      onPriorityChange(itemId, priority, targetItemId);
    }

    setDraggingItemId(null);
    setActiveDropPriority(null);
  };

  const handleDoneDrop = (
    event: DragEvent<HTMLDivElement>,
    targetItemId?: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const itemId = event.dataTransfer.getData('text/plain');

    if (itemId && itemId !== targetItemId) {
      onStatusChange(itemId, 'DONE', targetItemId);
    }

    setDraggingItemId(null);
    setActiveDropPriority(null);
    setIsDoneDropActive(false);
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-2">
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
                    <h2 className={typography.sectionTitle}>{quadrant.title}</h2>
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
                        <span className="absolute left-8 top-1/2 z-10 w-max max-w-[520px] -translate-y-1/2 whitespace-pre-line rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-lg">
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
                  <div
                    key={item.id}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'move';
                      setActiveDropPriority(quadrant.key);
                    }}
                    onDrop={(event) => handleDrop(event, quadrant.key, item.id)}
                  >
                    <ActionItemCard
                      item={item}
                      users={users}
                      onAssigneeChange={onAssigneeChange}
                      onDelete={onDelete}
                      isDeleting={deletingItemIds.includes(item.id)}
                      canChangeAssignee
                      onDragStart={setDraggingItemId}
                      onDragEnd={() => {
                        setDraggingItemId(null);
                        setActiveDropPriority(null);
                      }}
                      isDragging={draggingItemId === item.id}
                      compact
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={[
          'rounded-lg border border-border bg-secondary p-5 transition',
          isDoneDropActive ? 'bg-primary/5 ring-2 ring-primary/30' : '',
        ].join(' ')}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
          setIsDoneDropActive(true);
        }}
        onDragLeave={() => setIsDoneDropActive(false)}
        onDrop={handleDoneDrop}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <h2 className={typography.sectionTitle}>
              완료된 액션 아이템{' '}
              <span className="text-base text-muted-foreground">
                ({completedItems.length})
              </span>
            </h2>
          </div>
          <button
            type="button"
            className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
            onClick={() => setIsDoneOpen((open) => !open)}
          >
            {isDoneOpen ? '접기' : '펼치기'}
          </button>
        </div>

        {!isDoneOpen ? (
          <div className="mt-5 rounded-lg border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">
            완료된 업무 {completedItems.length}개가 접혀 있습니다.
          </div>
        ) : completedItems.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">
            아직 완료된 액션 아이템이 없습니다.
          </div>
        ) : (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {completedItems.map((item) => (
              <div
                key={item.id}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                  setIsDoneDropActive(true);
                }}
                onDrop={(event) => handleDoneDrop(event, item.id)}
              >
                <ActionItemCard
                  item={item}
                  users={users}
                  onAssigneeChange={onAssigneeChange}
                  onDelete={onDelete}
                  isDeleting={deletingItemIds.includes(item.id)}
                  canChangeAssignee
                  onDragStart={setDraggingItemId}
                  onDragEnd={() => {
                    setDraggingItemId(null);
                    setIsDoneDropActive(false);
                  }}
                  isDragging={draggingItemId === item.id}
                  compact
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ActionItemsMatrixView;
