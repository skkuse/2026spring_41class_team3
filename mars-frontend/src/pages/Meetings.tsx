import AiFeatureList from '../components/meetings/AiFeatureList';
import MeetingInputPanel from '../components/meetings/MeetingInputPanel';

function Meetings() {
  return (
    <main className="min-h-full bg-background px-6 py-8 text-foreground md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <h1 className="text-3xl text-primary">회의 입력</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            회의 제목, 목적, 회의록 내용을 입력해 액션 아이템을 추출하세요
          </p>
        </header>

        <MeetingInputPanel />
        <AiFeatureList />
      </div>
    </main>
  );
}

export default Meetings;
