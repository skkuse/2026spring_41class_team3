import type { DashboardMeeting } from './types';

interface RecentMeetingsPanelProps {
  meetings: DashboardMeeting[];
  onViewAll: () => void;
}

function RecentMeetingsPanel({ meetings, onViewAll }: RecentMeetingsPanelProps) {
  return (
    <section className="bg-card border border-border rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold font-['Rajdhani'] text-foreground">최근 회의 목록</h3>

        <button
          type="button"
          className="text-xs text-primary font-semibold hover:underline cursor-pointer"
          onClick={onViewAll}
        >
          전체 보기
        </button>
      </div>

      <div className="space-y-3">
        {meetings.length > 0 ? meetings.map((meeting) => (
          <RecentMeetingRow key={meeting.id} meeting={meeting} onClick={onViewAll} />
        )) : (
          <div className="rounded-xl border border-border/60 bg-[#1A1D23]/40 p-8 text-center text-sm text-muted-foreground">
            아직 표시할 회의와 액션 아이템이 없습니다.
          </div>
        )}
      </div>
    </section>
  );
}

interface RecentMeetingRowProps {
  meeting: DashboardMeeting;
  onClick: () => void;
}

function RecentMeetingRow({ meeting, onClick }: RecentMeetingRowProps) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between p-4 rounded-xl bg-[#1A1D23]/40 border border-border/60 hover:border-primary/40 cursor-pointer transition-all group text-left"
      onClick={onClick}
    >
      <div className="w-1/3">
        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-all">
          {meeting.title}
        </h4>
        <p className="text-xs text-muted-foreground mt-1">{meeting.date}</p>
      </div>

      <div className="flex items-center gap-6 text-center text-xs font-mono w-1/3 justify-center">
        <div>
          <div className="text-foreground font-bold">{meeting.items}</div>
          <div className="text-[10px] text-muted-foreground uppercase mt-0.5 font-sans">할 일</div>
        </div>
        <div>
          <div className="text-primary font-bold">{meeting.done}</div>
          <div className="text-[10px] text-muted-foreground uppercase mt-0.5 font-sans">완료</div>
        </div>
      </div>

      <div className="w-1/4 flex items-center justify-end">
        <div className="w-32 bg-[#23272F] h-1.5 rounded-full overflow-hidden">
          <div className="bg-primary h-full rounded-full" style={{ width: meeting.pct }} />
        </div>
      </div>
    </button>
  );
}

export default RecentMeetingsPanel;
