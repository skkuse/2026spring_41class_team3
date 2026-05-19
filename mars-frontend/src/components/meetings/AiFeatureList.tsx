import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Lightbulb } from 'lucide-react';

const features = [
  {
    title: '스마트 추출',
    description: '작업과 담당자를 자동으로 식별합니다.',
  },
  {
    title: '우선순위 감지',
    description: '긴급도와 중요도를 기반으로 우선순위를 감지합니다.',
  },
  {
    title: '마감일 인식',
    description: '날짜와 마감 기한을 인식합니다.',
  },
  {
    title: '컨텍스트 보존',
    description: '액션 아이템을 회의 맥락 내에서 추출합니다.',
  },
];

function AiFeatureList() {
  const [isOpen, setIsOpen] = useState(false);
  const featureListRef = useRef<HTMLDivElement>(null);
  const shouldScrollOnOpenRef = useRef(false);

  useEffect(() => {
    if (!isOpen || !shouldScrollOnOpenRef.current) {
      return;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      featureListRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
      shouldScrollOnOpenRef.current = false;
    });

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [isOpen]);

  const handleToggle = () => {
    const nextIsOpen = !isOpen;

    console.log('[Meetings] AI 기능 토글 버튼 클릭', {
      isOpen: nextIsOpen,
    });
    shouldScrollOnOpenRef.current = nextIsOpen;
    setIsOpen(nextIsOpen);
  };

  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-lg shadow-black/10">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between gap-4 text-left focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={isOpen}
      >
        <h2 className="flex items-center gap-2 text-2xl text-foreground">
          <Lightbulb className="size-5 text-primary" aria-hidden="true" />
          AI를 통해 처리할 수 있는 기능 알아보기
        </h2>
        <ChevronDown
          className={[
            'size-5 shrink-0 text-muted-foreground transition-transform',
            isOpen ? 'rotate-180' : 'rotate-0',
          ].join(' ')}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          ref={featureListRef}
          className="mt-5 grid scroll-mt-6 gap-4 md:grid-cols-2"
        >
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-lg border border-border bg-secondary/70 p-5"
            >
              <div className="flex gap-3">
                <span className="mt-1 size-2 rounded-full bg-primary shadow-[0_0_18px_rgba(224,74,47,0.75)]" />
                <div>
                  <h3 className="text-lg text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AiFeatureList;
