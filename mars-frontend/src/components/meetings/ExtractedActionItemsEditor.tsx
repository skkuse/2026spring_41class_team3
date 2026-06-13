import { Plus, Trash2 } from 'lucide-react';
import { matrixQuadrants, statusColumns } from '../actionItems/actionItemConfig';
import type { ActionItemPriority, ActionItemStatus, User } from '../actionItems/types';
import type { ExtractedActionItemDraft } from './meetingActionItemDrafts';

interface ExtractedActionItemsEditorProps {
  items: ExtractedActionItemDraft[];
  assigneeOptions: User[];
  onAddItem: () => void;
  onDeleteItem: (itemId: string) => void;
  onConfirmItems: () => void;
  onStartAdditionalMeeting: () => void;
  onViewActionItems: () => void;
  onItemChange: (
    itemId: string,
    field: keyof Omit<ExtractedActionItemDraft, 'id'>,
    value: string,
  ) => void;
  isConfirming: boolean;
  isConfirmed: boolean;
}

function ExtractedActionItemsEditor({
  items,
  assigneeOptions,
  onAddItem,
  onDeleteItem,
  onConfirmItems,
  onStartAdditionalMeeting,
  onViewActionItems,
  onItemChange,
  isConfirming,
  isConfirmed,
}: ExtractedActionItemsEditorProps) {
  const isLocked = isConfirming || isConfirmed;

  return (
    <div className="mt-8 border-t border-border pt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl text-foreground">추출된 액션 아이템 검토</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            설명, 담당자, 상태, 우선순위, 마감일을 확인하고 수정하세요.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddItem}
          disabled={isLocked}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground transition hover:border-primary/50 hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
          항목 추가
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {items.length > 0 ? (
          items.map((item, index) => (
            <ExtractedActionItemCard
              key={item.id}
              item={item}
              index={index}
              assigneeOptions={assigneeOptions}
              onDeleteItem={onDeleteItem}
              onItemChange={onItemChange}
              isLocked={isLocked}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-secondary/40 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              회의록을 입력하고 액션 아이템 생성을 누르면 추출 결과를 여기에서 검토할 수 있습니다.
            </p>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          {isConfirmed ? (
            <>
              <div className="flex items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-500">
                액션아이템 등록 완료!
              </div>
              <button
                type="button"
                onClick={onStartAdditionalMeeting}
                className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
              >
                추가 회의 입력하기
              </button>
              <button
                type="button"
                onClick={onViewActionItems}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground transition hover:bg-primary/90"
              >
                액션 아이템 확인하기
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={isConfirming}
                className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                임시 저장
              </button>
              <button
                type="button"
                onClick={onConfirmItems}
                disabled={isConfirming}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isConfirming ? '확정 중...' : '수정 내용 확정'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface ExtractedActionItemCardProps {
  item: ExtractedActionItemDraft;
  index: number;
  assigneeOptions: User[];
  onDeleteItem: (itemId: string) => void;
  isLocked: boolean;
  onItemChange: (
    itemId: string,
    field: keyof Omit<ExtractedActionItemDraft, 'id'>,
    value: string,
  ) => void;
}

function ExtractedActionItemCard({
  item,
  index,
  assigneeOptions,
  onDeleteItem,
  onItemChange,
  isLocked,
}: ExtractedActionItemCardProps) {
  return (
    <article className="rounded-lg border border-border bg-secondary/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-sm font-semibold text-primary">
          {index + 1}
        </div>

        <label className="min-w-0 flex-1">
          <span className="text-xs font-semibold text-muted-foreground">세부 내용</span>
          <textarea
            value={item.description}
            onChange={(event) => onItemChange(item.id, 'description', event.target.value)}
            disabled={isLocked}
            rows={2}
            placeholder="액션 아이템 내용을 입력하세요."
            className="mt-1 min-h-16 w-full resize-y rounded-md border border-input bg-input-background px-3 py-2 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring"
          />
        </label>

        <button
          type="button"
          aria-label="액션 아이템 삭제"
          onClick={() => onDeleteItem(item.id)}
          disabled={isLocked}
          className="mt-5 rounded-md p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">담당자</span>
          <select
            value={item.assignee_id}
            onChange={(event) => onItemChange(item.id, 'assignee_id', event.target.value)}
            disabled={isLocked}
            className="mt-1 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
          >
            <option value="">-</option>
            {assigneeOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">상태</span>
          <select
            value={item.status}
            onChange={(event) => onItemChange(item.id, 'status', event.target.value as ActionItemStatus)}
            disabled={isLocked}
            className="mt-1 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
          >
            {statusColumns.map((status) => (
              <option key={status.key} value={status.key}>
                {status.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">우선순위</span>
          <select
            value={item.priority}
            onChange={(event) => onItemChange(item.id, 'priority', event.target.value as ActionItemPriority)}
            disabled={isLocked}
            className="mt-1 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
          >
            {matrixQuadrants.map((priority) => (
              <option key={priority.key} value={priority.key}>
                {priority.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">마감일</span>
          <input
            type="date"
            value={item.deadline}
            onChange={(event) => onItemChange(item.id, 'deadline', event.target.value)}
            disabled={isLocked}
            className="mt-1 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>
    </article>
  );
}

export default ExtractedActionItemsEditor;
