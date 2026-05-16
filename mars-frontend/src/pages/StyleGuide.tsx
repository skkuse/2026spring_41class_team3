const colorTokens = [
  { name: 'background', className: 'bg-background', textClassName: 'text-foreground' },
  { name: 'foreground', className: 'bg-foreground', textClassName: 'text-background' },
  { name: 'card', className: 'bg-card', textClassName: 'text-card-foreground' },
  { name: 'secondary', className: 'bg-secondary', textClassName: 'text-secondary-foreground' },
  { name: 'muted', className: 'bg-muted', textClassName: 'text-muted-foreground' },
  { name: 'primary', className: 'bg-primary', textClassName: 'text-primary-foreground' },
  { name: 'accent', className: 'bg-accent', textClassName: 'text-accent-foreground' },
  { name: 'destructive', className: 'bg-destructive', textClassName: 'text-destructive-foreground' },
  { name: 'chart-1', className: 'bg-chart-1', textClassName: 'text-foreground' },
  { name: 'chart-2', className: 'bg-chart-2', textClassName: 'text-foreground' },
  { name: 'chart-3', className: 'bg-chart-3', textClassName: 'text-background' },
  { name: 'chart-4', className: 'bg-chart-4', textClassName: 'text-foreground' },
  { name: 'chart-5', className: 'bg-chart-5', textClassName: 'text-foreground' },
  { name: 'sidebar', className: 'bg-sidebar', textClassName: 'text-sidebar-foreground' },
  { name: 'sidebar-accent', className: 'bg-sidebar-accent', textClassName: 'text-sidebar-accent-foreground' },
  { name: 'input-background', className: 'bg-input-background', textClassName: 'text-foreground' },
];

const textSamples = [
  { name: 'text-xs', className: 'text-xs', sample: '작은 라벨과 보조 정보에 사용하는 크기' },
  { name: 'text-sm', className: 'text-sm', sample: '설명 문구와 간단한 메타데이터에 적합한 크기' },
  { name: 'text-base', className: 'text-base', sample: '본문을 읽기 편하게 보여주는 기본 크기' },
  { name: 'text-lg', className: 'text-lg', sample: '섹션 제목이나 강조 행에 사용하는 크기' },
  { name: 'text-xl', className: 'text-xl', sample: '패널 제목처럼 위계를 더 강하게 줄 때 쓰는 크기' },
  { name: 'text-2xl', className: 'text-2xl', sample: '큰 제목 샘플' },
  { name: 'text-3xl', className: 'text-3xl', sample: '페이지 제목 샘플' },
  { name: 'text-4xl', className: 'text-4xl', sample: '화면 상단 강조 제목 샘플' },
];

const radiusSamples = [
  { name: 'rounded-sm', className: 'rounded-sm' },
  { name: 'rounded-md', className: 'rounded-md' },
  { name: 'rounded-lg', className: 'rounded-lg' },
  { name: 'rounded-xl', className: 'rounded-xl' },
];

function StyleGuide() {
  return (
    <main className="min-h-full bg-background px-6 py-8 text-foreground md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header>
          <h1 className="text-3xl text-primary">글로벌 스타일</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            테마 색상, 타이포그래피, 간격, 테두리, 컨트롤 상태를 확인합니다.
          </p>
        </header>

        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-5">
            <h2 className="text-2xl text-foreground">색상</h2>
            <p className="text-sm text-muted-foreground">
              theme.css에 정의된 토큰을 Tailwind utility class로 확인합니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {colorTokens.map((token) => (
              <div
                key={token.name}
                className="overflow-hidden rounded-lg border border-border bg-secondary"
              >
                <div
                  className={[
                    'flex h-20 items-end p-3',
                    token.className,
                    token.textClassName,
                  ].join(' ')}
                >
                  <span className="text-sm font-semibold">{token.name}</span>
                </div>
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  {token.className}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-5">
              <h2 className="text-2xl text-foreground">타이포그래피</h2>
              <p className="text-sm text-muted-foreground">
                제목에는 Rajdhani, 본문에는 Manrope를 사용합니다.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase text-muted-foreground">제목</p>
                <div className="mt-3 space-y-2">
                  <h1>h1 / Rajdhani</h1>
                  <h2>h2 / Rajdhani</h2>
                  <h3>h3 / Rajdhani</h3>
                  <h4>h4 / Manrope</h4>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase text-muted-foreground">본문</p>
                <p className="mt-3 text-base text-foreground">
                  기본 본문은 Manrope와 전역 foreground 토큰을 사용합니다.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  muted 텍스트는 설명, 메타데이터, 보조 라벨에 사용합니다.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-5">
              <h2 className="text-2xl text-foreground">텍스트 크기</h2>
              <p className="text-sm text-muted-foreground">
                앱에서 자주 사용하는 Tailwind 텍스트 크기입니다.
              </p>
            </div>

            <div className="space-y-3">
              {textSamples.map((sample) => (
                <div key={sample.name} className="rounded-md border border-border bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">{sample.name}</p>
                  <p className={`${sample.className} text-foreground`}>
                    {sample.sample}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-2xl text-foreground">버튼</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition hover:opacity-90">
                Primary
              </button>
              <button className="rounded-lg border border-border bg-secondary px-4 py-2 text-secondary-foreground transition hover:bg-sidebar-accent">
                Secondary
              </button>
              <button className="rounded-lg bg-destructive px-4 py-2 text-destructive-foreground transition hover:opacity-90">
                Destructive
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-2xl text-foreground">입력 필드</h2>
            <div className="mt-5 space-y-3">
              <label className="block text-sm text-muted-foreground" htmlFor="style-guide-input">
                라벨
              </label>
              <input
                id="style-guide-input"
                className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="플레이스홀더 텍스트"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-2xl text-foreground">모서리 반경</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {radiusSamples.map((sample) => (
                <div
                  key={sample.name}
                  className={`${sample.className} border border-border bg-secondary p-4 text-sm text-muted-foreground`}
                >
                  {sample.name}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default StyleGuide;
