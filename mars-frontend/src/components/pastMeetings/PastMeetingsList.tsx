import PastMeetingCard from './PastMeetingCard';
import PastMeetingDetailPanel from './PastMeetingDetailPanel';
import type { PastMeeting, PastMeetingDetail } from './types';

interface PastMeetingsListProps {
  meetings: PastMeeting[];
  selectedMeetingId: string | null;
  detail: PastMeetingDetail | null;
  onSelectMeeting: (meetingId: string) => void;
  onDeleteMeeting: (meetingId: string) => void;
}

function PastMeetingsList({
  meetings,
  selectedMeetingId,
  detail,
  onSelectMeeting,
  onDeleteMeeting,
}: PastMeetingsListProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-col gap-3">
        {meetings.map((meeting) => {
          const isSelected = selectedMeetingId === meeting.id;

          return (
            <div key={meeting.id}>
              <PastMeetingCard
                meeting={meeting}
                isSelected={isSelected}
                onSelect={onSelectMeeting}
                onDelete={onDeleteMeeting}
              />

              {isSelected && detail ? (
                <PastMeetingDetailPanel detail={detail} />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default PastMeetingsList;
