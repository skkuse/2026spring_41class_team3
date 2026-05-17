const pastMeetings = [
  {
    id: 1,
    title: 'MARS 초기 아이디어 회의',
    date: '2026-04-12',
    actionItems: 5,
    completed: 5,
  },
  {
    id: 2,
    title: 'MARS 기획안 발표 자료 회의',
    date: '2026-04-10',
    actionItems: 10,
    completed: 10,
  },
  {
    id: 3,
    title: '역할 분배 및 진행 상황 보고',
    date: '2026-04-08',
    actionItems: 6,
    completed: 6,
  },
];

function PastMeetings() {
  return (
    <main className="min-h-full bg-background px-6 py-8 text-foreground md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <h1 className="text-3xl text-primary">지난 회의</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            이전 회의와 추출된 액션 아이템 진행 현황을 확인하세요.
          </p>
        </header>

        <section className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col gap-3">
            {pastMeetings.map((meeting) => (
              <article
                key={meeting.id}
                className="rounded-lg border border-border bg-secondary p-4 transition hover:border-primary/50"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl text-foreground">{meeting.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {meeting.date}
                    </p>
                  </div>

                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <span>액션 아이템 {meeting.actionItems}</span>
                    <span>완료 {meeting.completed}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default PastMeetings;
