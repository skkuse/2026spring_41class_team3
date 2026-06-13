import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { PastMeetingDetail } from './types';
import { typography } from '../../lib/typography';

interface PastMeetingDetailPanelProps {
  detail: PastMeetingDetail;
}

function PastMeetingDetailPanel({ detail }: PastMeetingDetailPanelProps) {
  const [isRawTextOpen, setIsRawTextOpen] = useState(false);
  const score = toProductivityPercent(detail.productivity_score);
  const scoreLabel = score.toFixed(1);
  const rawText = detail.raw_text.trim();

  return (
    <section className="mt-4 rounded-lg border border-border bg-secondary p-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          <p className={typography.metaUpper}>회의 요약</p>
          <h3 className={`mt-2 ${typography.cardTitleLarge}`}>{detail.title}</h3>
          <p className={`mt-3 ${typography.body}`}>
            {detail.summary}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <p className={typography.metaUpper}>진행 현황</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className={typography.meta}>추출된 액션 아이템</p>
              <p className={`mt-1 ${typography.statValue}`}>{detail.actionItems}</p>
            </div>
            <div>
              <p className={typography.meta}>완료</p>
              <p className={`mt-1 ${typography.statValueAccent}`}>{detail.completed}</p>
            </div>
          </div>
          <div className="mt-4 flex items-end gap-2">
            <span className={`pb-1 ${typography.pageDescription}`}>생산성 점수</span>
            <span className="text-2xl font-semibold text-primary">{scoreLabel}</span>
            <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
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
          <p className={typography.metaUpper}>회의 목적</p>
          <p className={`mt-2 ${typography.bodyStrong}`}>
            {detail.purpose}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <p className={typography.metaUpper}>정성 피드백</p>
          <p className={`mt-2 ${typography.bodyStrong}`}>
            {detail.qualitative_feedback}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left transition hover:border-primary/50 hover:bg-card/80"
          aria-expanded={isRawTextOpen}
          onClick={() => setIsRawTextOpen((open) => !open)}
        >
          <span className={typography.bodyStrong}>회의록 원문 보기</span>
          <ChevronDown
            className={[
              'h-5 w-5 text-muted-foreground transition-transform',
              isRawTextOpen ? 'rotate-180' : '',
            ].join(' ')}
          />
        </button>

        {isRawTextOpen ? (
          <div className="mt-3 max-h-80 overflow-y-auto rounded-lg border border-border bg-card p-4">
            <p
              className={`whitespace-pre-wrap ${rawText ? typography.body : 'text-sm text-muted-foreground'}`}
            >
              {rawText || '회의록 원문이 없습니다.'}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

const toProductivityPercent = (score: number) => {
  const percentScore = score <= 1 ? score * 100 : score;

  return Math.max(0, Math.min(100, percentScore));
};

export default PastMeetingDetailPanel;
