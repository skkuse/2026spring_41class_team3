import { Plus, Trash2 } from 'lucide-react';
import { matrixQuadrants, statusColumns } from '../actionItems/actionItemConfig';
import type { ActionItemPriority, ActionItemStatus, User } from '../actionItems/types';
import type { ExtractedActionItemDraft } from './meetingActionItemDrafts';

interface ExtractedActionItemsEditorProps {
  items: ExtractedActionItemDraft[];
  assigneeOptions: User[];
  onAddItem: () => void;
  onDeleteItem: (itemId: string) => void;
  onItemChange: (
    itemId: string,
    field: keyof Omit<ExtractedActionItemDraft, 'id'>,
    value: string,
  ) => void;
}

function ExtractedActionItemsEditor({
  items,
  assigneeOptions,
  onAddItem,
  onDeleteItem,
  onItemChange,
}: ExtractedActionItemsEditorProps) {
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
          <button
            type="button"
            className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
          >
            임시 저장
          </button>
          <button
            type="button"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground transition hover:bg-primary/90"
          >
            수정 내용 확정
          </button>
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
            rows={2}
            placeholder="액션 아이템 내용을 입력하세요."
            className="mt-1 min-h-16 w-full resize-y rounded-md border border-input bg-input-background px-3 py-2 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring"
          />
        </label>

        <button
          type="button"
          aria-label="액션 아이템 삭제"
          onClick={() => onDeleteItem(item.id)}
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
            className="mt-1 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
          >
            {!item.assignee_id && (
              <option value="">담당자 선택</option>
            )}
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
            className="mt-1 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>
    </article>
  );
}

export default ExtractedActionItemsEditor;
