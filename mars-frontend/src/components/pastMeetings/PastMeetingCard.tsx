import type { PastMeeting } from './types';

interface PastMeetingCardProps {
  meeting: PastMeeting;
  isSelected: boolean;
  onSelect: (meetingId: string) => void;
}

function PastMeetingCard({
  meeting,
  isSelected,
  onSelect,
}: PastMeetingCardProps) {
  return (
    <button
      type="button"
      className={[
        'w-full rounded-lg border bg-secondary p-4 text-left transition',
        isSelected
          ? 'border-primary/70 ring-2 ring-primary/20'
          : 'border-border hover:border-primary/50',
      ].join(' ')}
      onClick={() => onSelect(meeting.id)}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl text-foreground">{meeting.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{meeting.date}</p>
        </div>

        <div className="flex gap-6 text-sm text-muted-foreground">
          <span>액션 아이템 {meeting.actionItems}</span>
          <span>완료 {meeting.completed}</span>
        </div>
      </div>
    </button>
  );
}

export default PastMeetingCard;
