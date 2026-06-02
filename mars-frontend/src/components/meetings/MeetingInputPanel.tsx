import { useState } from 'react';
import { createMeeting } from '../../lib/api';
import { getStoredProjectContext } from '../../lib/projectContext';

// import UploadOptionCard from './UploadOptionCard';

const placeholder = `이곳에 입력해주세요.`;

function MeetingInputPanel() {
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [rawText, setRawText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'success' | 'error'>('success');

  const handleGenerate = async () => {
    const projectContext = getStoredProjectContext();
    const projectId = projectContext?.projectId ?? '';
    const trimmedTitle = title.trim();
    const trimmedPurpose = purpose.trim();
    const trimmedRawText = rawText.trim();

    if (!trimmedTitle) {
      setMessageTone('error');
      setMessage('회의 제목을 입력해 주세요.');
      return;
    }

    if (!projectId || !isUuid(projectId)) {
      setMessageTone('error');
      setMessage('프로젝트 정보를 확인할 수 없습니다. 프로젝트에 다시 접속해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const createdMeeting = await createMeeting(projectId, {
        title: trimmedTitle,
        purpose: trimmedPurpose || null,
        raw_text: trimmedRawText || null,
      });

      console.log('[Meetings][CreateMeeting:OK]', {
        projectId,
        meeting: createdMeeting,
      });
      setMessageTone('success');
      setMessage('회의가 생성되었습니다. 액션 아이템 추출 결과는 연결되는 API에 맞춰 이어 붙일 예정입니다.');
    } catch (error) {
      console.error('[Meetings][CreateMeeting:Failed]', {
        projectId,
        title: trimmedTitle,
        purpose: trimmedPurpose || null,
        raw_text: trimmedRawText || null,
        error,
      });
      setMessageTone('error');
      setMessage('회의 생성에 실패했습니다. 입력값과 프로젝트 정보를 확인해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    console.log('[Meetings] 지우기 버튼 클릭');
    setTitle('');
    setPurpose('');
    setRawText('');
    setMessage('');
  };

  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-lg shadow-black/10">
      {/* 파일 업로드와 오디오 녹음은 우선 주석 처리해둡니다!!
      <div className="grid gap-4 md:grid-cols-2">
        <UploadOptionCard
          icon="upload"
          title="파일 업로드"
          description="TXT, PDF, DOCX"
          onClick={() => console.log('[Meetings][API] 파일 업로드 버튼 클릭')}
        />
        <UploadOptionCard
          icon="record"
          title="오디오 녹음"
          description="실시간 전사"
          onClick={() => console.log('[Meetings][API] 오디오 녹음 버튼 클릭')}
        />
      </div> */}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block" htmlFor="meeting-title">
          <span className="text-sm text-foreground">회의 제목</span>
          <input
            id="meeting-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="예: MARS 기획 회의"
            className="mt-3 w-full rounded-lg border border-input bg-input-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/80 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="block" htmlFor="meeting-purpose">
          <span className="text-sm text-foreground">회의 목적</span>
          <input
            id="meeting-purpose"
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            placeholder="예: 액션 아이템 추출 및 담당자 정리"
            className="mt-3 w-full rounded-lg border border-input bg-input-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/80 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      <div className="mt-6">
        <label htmlFor="meeting-notes" className="text-sm text-foreground">
          회의록 내용
        </label>
        <textarea
          id="meeting-notes"
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          placeholder={placeholder}
          className="mt-3 min-h-72 w-full resize-y rounded-lg border border-input bg-input-background px-4 py-4 text-sm leading-6 text-foreground placeholder:text-muted-foreground/80 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleClear}
          disabled={isSubmitting}
          className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          지우기
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? '생성 중...' : '액션 아이템 생성'}
        </button>
      </div>

      {message && (
        <p
          className={[
            'mt-4 text-sm',
            messageTone === 'success' ? 'text-emerald-500' : 'text-primary',
          ].join(' ')}
        >
          {message}
        </p>
      )}
    </section>
  );
}

const isUuid = (value: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

export default MeetingInputPanel;
