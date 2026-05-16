import { useState } from 'react';

import UploadOptionCard from './UploadOptionCard';

const placeholder = `이곳에 입력해주세요.`;

function MeetingInputPanel() {
  const [notes, setNotes] = useState('');

  const handleGenerate = () => {
    console.log('액션 아이템 생성', { notes });
  };

  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-lg shadow-black/10">
      <div className="grid gap-4 md:grid-cols-2">
        <UploadOptionCard
          icon="upload"
          title="파일 업로드"
          description="TXT, PDF, DOCX"
        />
        <UploadOptionCard
          icon="record"
          title="오디오 녹음"
          description="실시간 전사"
        />
      </div>

      <div className="mt-7">
        <label htmlFor="meeting-notes" className="text-sm text-foreground">
          또는 회의록을 붙여넣으세요:
        </label>
        <textarea
          id="meeting-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={placeholder}
          className="mt-3 min-h-72 w-full resize-y rounded-lg border border-input bg-input-background px-4 py-4 text-sm leading-6 text-foreground placeholder:text-muted-foreground/80 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => setNotes('')}
          className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          지우기
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
        >
          액션 아이템 생성
        </button>
      </div>
    </section>
  );
}

export default MeetingInputPanel;
