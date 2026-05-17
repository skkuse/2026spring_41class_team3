import { useState } from 'react';
import {
  pastMeetingDetails,
  pastMeetings,
} from '../components/pastMeetings/pastMeetingsData';
import PastMeetingsList from '../components/pastMeetings/PastMeetingsList';

function PastMeetings() {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  const selectedDetail = selectedMeetingId
    ? (pastMeetingDetails[selectedMeetingId] ?? null)
    : null;

  const handleSelectMeeting = (meetingId: string) => {
    if (selectedMeetingId === meetingId) {
      console.log('[PastMeetings] 지난 회의 상세 닫기', { meetingId });
      setSelectedMeetingId(null);
      return;
    }

    console.log('[PastMeetings][API] 지난 회의 상세 조회 클릭', {
      meetingId,
    });
    setSelectedMeetingId(meetingId);
  };

  return (
    <main className="min-h-full bg-background px-6 py-8 text-foreground md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <h1 className="text-3xl text-primary">지난 회의</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            이전 회의의 내용과 추출된 액션 아이템 진행 현황을 확인하세요.
          </p>
        </header>

        <PastMeetingsList
          meetings={pastMeetings}
          selectedMeetingId={selectedMeetingId}
          detail={selectedDetail}
          onSelectMeeting={handleSelectMeeting}
        />
      </div>
    </main>
  );
}

export default PastMeetings;
