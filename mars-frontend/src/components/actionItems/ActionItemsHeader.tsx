import { LayoutGrid, ListChecks } from 'lucide-react';
import { priorityLegend } from './actionItemConfig';
import type { ActionItemsViewMode, User } from './types';

interface ActionItemsHeaderProps {
  viewMode: ActionItemsViewMode;
  onViewModeChange: (viewMode: ActionItemsViewMode) => void;
  users: User[];
  currentUserId: string;
  showAllItems: boolean;
  onShowAllItemsChange: (showAllItems: boolean) => void;
}

function ActionItemsHeader({
  viewMode,
  onViewModeChange,
  users,
  currentUserId,
  showAllItems,
  onShowAllItemsChange,
}: ActionItemsHeaderProps) {
  const currentUser = users.find((user) => user.id === currentUserId);

  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-3xl text-primary">액션 아이템</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          작업 관리 및 추적
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:items-end">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {priorityLegend.map((priority) => (
            <span key={priority.label} className="flex items-center gap-2">
              <span
                className={`h-3 w-3 rounded-full ${priority.markerClass}`}
              />
              {priority.label}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={showAllItems}
              disabled={!currentUser}
              onChange={(event) => onShowAllItemsChange(event.target.checked)}
              className="h-4 w-4 accent-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
            전체 할일 보기
          </label>

          <div className="grid grid-cols-2 rounded-lg border border-border bg-secondary p-1">
            <button
              type="button"
              aria-pressed={viewMode === '리스트'}
              className={[
                'flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition',
                viewMode === '리스트'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
              onClick={() => onViewModeChange('리스트')}
            >
              <ListChecks className="h-4 w-4" />
              리스트
            </button>
            <button
              type="button"
              aria-pressed={viewMode === '매트릭스'}
              className={[
                'flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition',
                viewMode === '매트릭스'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
              onClick={() => onViewModeChange('매트릭스')}
            >
              <LayoutGrid className="h-4 w-4" />
              매트릭스
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default ActionItemsHeader;
