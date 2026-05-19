import { useState } from 'react';
import { Plus } from 'lucide-react';
import { matrixQuadrants, statusColumns } from './actionItemConfig';
import type { ActionItemPriority, ActionItemStatus, NewActionItemInput, User } from './types';

interface ActionItemCreateBoxProps {
  users: User[];
  currentUserId: string;
  onCreate: (input: NewActionItemInput) => void;
}

function ActionItemCreateBox({
  users,
  currentUserId,
  onCreate,
}: ActionItemCreateBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState(currentUserId);
  const [priority, setPriority] = useState<ActionItemPriority>('DO');
  const [status, setStatus] = useState<ActionItemStatus>('TODO');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = () => {
    if (!description.trim() || !deadline) {
      return;
    }

    onCreate({
      description: description.trim(),
      assignee_id: assigneeId,
      priority,
      status,
      deadline,
    });

    setDescription('');
    setAssigneeId(currentUserId);
    setPriority('DO');
    setStatus('TODO');
    setDeadline('');
    setIsOpen(false);
  };

  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground transition hover:border-primary/50 hover:bg-muted"
        onClick={() => setIsOpen((open) => !open)}
      >
        <Plus className="h-4 w-4" />
        새 액션 아이템
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-11 z-30 w-80 rounded-lg border border-border bg-card p-4 shadow-xl">
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs text-muted-foreground">할 일</span>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                placeholder="예: 회의록 요약 공유"
              />
            </label>

            <label className="block">
              <span className="text-xs text-muted-foreground">담당자</span>
              <select
                value={assigneeId}
                onChange={(event) => setAssigneeId(event.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-muted-foreground">구분</span>
                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as ActionItemPriority)
                  }
                  className="mt-1 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  {matrixQuadrants.map((quadrant) => (
                    <option key={quadrant.key} value={quadrant.key}>
                      {quadrant.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs text-muted-foreground">상태</span>
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as ActionItemStatus)
                  }
                  className="mt-1 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                >
                  {statusColumns.map((column) => (
                    <option key={column.key} value={column.key}>
                      {column.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-xs text-muted-foreground">마감일</span>
              <input
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                취소
              </button>
              <button
                type="button"
                className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground transition hover:opacity-90"
                onClick={handleSubmit}
              >
                생성
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ActionItemCreateBox;
