import { useState, type DragEvent } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  GripVertical,
  Trash2,
} from 'lucide-react';
import { priorityConfig } from './actionItemConfig';
import type { ActionItem, User } from './types';

interface ActionItemCardProps {
  item: ActionItem;
  compact?: boolean;
  users: User[];
  onAssigneeChange: (itemId: string, assigneeId: string) => void;
  onDelete: (itemId: string) => void;
  isDeleting?: boolean;
  canChangeAssignee?: boolean;
  onDragStart?: (itemId: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  canDrag?: boolean;
}

function ActionItemCard({
  item,
  compact = false,
  users,
  onAssigneeChange,
  onDelete,
  isDeleting = false,
  canChangeAssignee = false,
  onDragStart,
  onDragEnd,
  isDragging = false,
  canDrag = true,
}: ActionItemCardProps) {
  const [isAssigneeMenuOpen, setIsAssigneeMenuOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const priority = priorityConfig[item.priority];
  const assignee = users.find((user) => user.id === item.assignee_id);
  const assigneeName = assignee?.name ?? '담당자 미지정';
  const assigneeControlTitle = canChangeAssignee
    ? '담당자 변경'
    : '담당자 변경 API가 아직 없어 변경할 수 없습니다.';
  const deadlineLabel = item.deadline.split('T')[0];
  const deadlineTime = new Date(item.deadline).getTime();
  const tomorrowStart = new Date();
  tomorrowStart.setHours(0, 0, 0, 0);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const dayAfterTomorrowStart = new Date(tomorrowStart);
  dayAfterTomorrowStart.setDate(dayAfterTomorrowStart.getDate() + 1);
  const isDueTomorrow =
    deadlineTime >= tomorrowStart.getTime() &&
    deadlineTime < dayAfterTomorrowStart.getTime();

  const handleDragStart = (event: DragEvent<HTMLElement>) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', item.id);
    onDragStart?.(item.id);
  };

  return (
    <article
      draggable={canDrag && !isAssigneeMenuOpen}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className={[
        'group relative rounded-lg border border-border transition hover:border-primary/50',
        isDueTomorrow ? 'bg-destructive/10 border-destructive/40' : 'bg-card',
        isDragging ? 'opacity-50 ring-2 ring-primary/40' : '',
        compact ? 'p-4' : 'min-h-[154px] p-6',
      ].join(' ')}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1 rounded-l-lg ${priority.markerClass}`}
      />

      <div className="flex gap-4">
        <GripVertical
          className={[
            'mt-1 h-5 w-5 shrink-0 text-muted-foreground/80',
            canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default opacity-40',
          ].join(' ')}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={[
                "font-['Rajdhani'] font-semibold leading-snug text-foreground",
                compact ? 'text-lg' : 'text-xl',
              ].join(' ')}
            >
              {item.description}
            </h3>

            <div className="relative flex shrink-0 items-center gap-3">
              <span
                className={[
                  'h-2.5 w-2.5 rounded-full',
                  priority.markerClass,
                ].join(' ')}
              />
              <button
                type="button"
                aria-label={isDeleting ? '액션 아이템 삭제 중' : '액션 아이템 삭제'}
                disabled={isDeleting}
                className="rounded-md border border-border bg-secondary p-1 text-muted-foreground transition hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsDeleteConfirmOpen((open) => !open);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>

              {isDeleteConfirmOpen ? (
                <div className="absolute right-0 top-7 z-30 w-52 rounded-lg border border-border bg-card p-3 text-sm shadow-xl">
                  <p className="text-foreground">정말 삭제할까요?</p>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                      disabled={isDeleting}
                      onClick={() => setIsDeleteConfirmOpen(false)}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      className="rounded-md bg-destructive px-2 py-1 text-xs text-destructive-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isDeleting}
                      onClick={() => onDelete(item.id)}
                    >
                      {isDeleting ? '삭제 중' : '삭제'}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="relative flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">
                {assigneeName.slice(1, 3)}
              </span>

              <span className="text-muted-foreground">담당자</span>

              <button
                type="button"
                aria-haspopup={canChangeAssignee ? 'listbox' : undefined}
                aria-expanded={canChangeAssignee ? isAssigneeMenuOpen : undefined}
                disabled={!canChangeAssignee}
                title={assigneeControlTitle}
                className={[
                  'flex min-w-24 items-center justify-between gap-2 rounded-full border px-3 py-1 text-sm transition',
                  isAssigneeMenuOpen
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-secondary text-foreground hover:border-primary/50 hover:bg-muted',
                  !canChangeAssignee ? 'cursor-default opacity-80 hover:border-border hover:bg-secondary' : '',
                ].join(' ')}
                onClick={() => {
                  if (canChangeAssignee) {
                    setIsAssigneeMenuOpen((isOpen) => !isOpen);
                  }
                }}
              >
                <span>{assigneeName}</span>
                {canChangeAssignee ? (
                  <ChevronDown
                    className={[
                      'h-4 w-4 text-muted-foreground transition',
                      isAssigneeMenuOpen ? 'rotate-180' : '',
                    ].join(' ')}
                  />
                ) : null}
              </button>

              {canChangeAssignee && isAssigneeMenuOpen ? (
                <div
                  role="listbox"
                  className="absolute left-20 top-9 z-20 w-36 overflow-hidden rounded-lg border border-border bg-card shadow-xl"
                >
                  {users.map((user) => {
                    const isSelected = user.id === item.assignee_id;

                    return (
                      <button
                        key={user.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={[
                          'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition',
                          isSelected
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                        ].join(' ')}
                        onClick={() => {
                          onAssigneeChange(item.id, user.id);
                          setIsAssigneeMenuOpen(false);
                        }}
                      >
                        <span>{user.name}</span>
                        {isSelected ? <Check className="h-4 w-4" /> : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              마감: {deadlineLabel}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ActionItemCard;
