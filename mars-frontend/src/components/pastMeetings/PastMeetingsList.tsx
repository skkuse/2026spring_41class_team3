import PastMeetingCard from './PastMeetingCard';
import PastMeetingDetailPanel from './PastMeetingDetailPanel';
import type { PastMeeting, PastMeetingDetail } from './types';

interface PastMeetingsListProps {
  meetings: PastMeeting[];
  selectedMeetingId: string | null;
  detail: PastMeetingDetail | null;
  generatedAgendaMeetingIds: string[];
  generatingAgendaMeetingIds: string[];
  onSelectMeeting: (meetingId: string) => void;
  onDeleteMeeting: (meetingId: string) => void;
  onCreateAgenda: (meetingId: string) => void;
  onViewSuggestions: () => void;
}

function PastMeetingsList({
  meetings,
  selectedMeetingId,
  detail,
  generatedAgendaMeetingIds,
  generatingAgendaMeetingIds,
  onSelectMeeting,
  onDeleteMeeting,
  onCreateAgenda,
  onViewSuggestions,
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
                hasGeneratedAgenda={generatedAgendaMeetingIds.includes(meeting.id)}
                isGeneratingAgenda={generatingAgendaMeetingIds.includes(meeting.id)}
                onSelect={onSelectMeeting}
                onDelete={onDeleteMeeting}
                onCreateAgenda={onCreateAgenda}
                onViewSuggestions={onViewSuggestions}
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
