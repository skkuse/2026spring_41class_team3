import type { PastMeetingDetail } from './types';

interface PastMeetingDetailPanelProps {
  detail: PastMeetingDetail;
}

function PastMeetingDetailPanel({ detail }: PastMeetingDetailPanelProps) {
  const score = Math.max(0, Math.min(100, detail.productivity_score));

  return (
    <section className="mt-4 rounded-lg border border-border bg-secondary p-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-xs uppercase text-muted-foreground">회의 요약</p>
          <h3 className="mt-2 text-xl text-foreground">{detail.title}</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {detail.summary}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">진행 현황</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">추출된 액션 아이템</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{detail.actionItems}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">완료</p>
              <p className="mt-1 text-2xl font-semibold text-primary">{detail.completed}</p>
            </div>
          </div>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-3xl font-semibold text-primary">{score}</span>
            <span className="pb-1 text-sm text-muted-foreground">/ 100 생산성</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">회의 목적</p>
          <p className="mt-2 text-sm leading-6 text-foreground">
            {detail.purpose}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase text-muted-foreground">정성 피드백</p>
          <p className="mt-2 text-sm leading-6 text-foreground">
            {detail.qualitative_feedback}
          </p>
        </div>
      </div>
    </section>
  );
}

export default PastMeetingDetailPanel;
