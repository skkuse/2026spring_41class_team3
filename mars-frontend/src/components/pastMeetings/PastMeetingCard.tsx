import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { typography } from '../../lib/typography';
import type { PastMeeting } from './types';

interface PastMeetingCardProps {
  meeting: PastMeeting;
  isSelected: boolean;
  onSelect: (meetingId: string) => void;
  onDelete: (meetingId: string) => void;
}

function PastMeetingCard({
  meeting,
  isSelected,
  onSelect,
  onDelete,
}: PastMeetingCardProps) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  return (
    <article
      className={[
        'rounded-lg border bg-secondary p-4 transition',
        isSelected
          ? 'border-primary/70 ring-2 ring-primary/20'
          : 'border-border hover:border-primary/50',
      ].join(' ')}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            className="text-left"
            onClick={() => onSelect(meeting.id)}
          >
            <h2 className={`${typography.cardTitleLarge} transition hover:text-primary`}>{meeting.title}</h2>
          </button>
          <p className={`mt-1 ${typography.pageDescription}`}>{meeting.date}</p>
        </div>

        <div className="relative flex flex-wrap items-center justify-end gap-3 text-sm text-muted-foreground">
          <button
            type="button"
            className="flex gap-6 text-left transition hover:text-foreground"
            onClick={() => onSelect(meeting.id)}
          >
            <span>추출된 액션 아이템 {meeting.actionItems}</span>
            <span>완료 {meeting.completed}</span>
          </button>
          <button
            type="button"
            aria-label={`${meeting.title} 삭제`}
            className="rounded-md p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setIsDeleteConfirmOpen((open) => !open)}
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {isDeleteConfirmOpen ? (
            <div className="absolute right-0 top-10 z-30 w-56 rounded-lg border border-border bg-card p-3 text-sm shadow-xl">
              <p className="text-foreground">정말 삭제할까요?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                회의록과 연결된 분석 내용을 삭제합니다.
              </p>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-xs text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="rounded-md bg-destructive px-2 py-1 text-xs text-destructive-foreground transition hover:opacity-90"
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    onDelete(meeting.id);
                  }}
                >
                  삭제
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default PastMeetingCard;
