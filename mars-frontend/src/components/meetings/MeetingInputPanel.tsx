import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../actionItems/types';
import ExtractedActionItemsEditor from './ExtractedActionItemsEditor';
import {
  createAndFetchMeetingActionItems,
  getFutureDate,
  isUuid,
  toActionItemDraft,
  type ExtractedActionItemDraft,
} from './meetingActionItemDrafts';
import { createActionItem, createMeeting, getProjectMembers } from '../../lib/api';
import type { ActionItemCreateRequest, MeetingResponse } from '../../lib/api';
import { getStoredProjectContext } from '../../lib/projectContext';

// import UploadOptionCard from './UploadOptionCard';

const placeholder = `이곳에 입력해주세요.`;

function MeetingInputPanel() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [rawText, setRawText] = useState('');
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [isExtractingActionItems, setIsExtractingActionItems] = useState(false);
  const [isConfirmingActionItems, setIsConfirmingActionItems] = useState(false);
  const [hasConfirmedActionItems, setHasConfirmedActionItems] = useState(false);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'success' | 'error'>('success');
  const [createdMeeting, setCreatedMeeting] = useState<MeetingResponse | null>(null);
  const [extractedItems, setExtractedItems] = useState<ExtractedActionItemDraft[]>([]);
  const [assigneeOptions, setAssigneeOptions] = useState<User[]>([]);
  const firstAssigneeId = assigneeOptions[0]?.id ?? '';
  const isMeetingCreated = Boolean(createdMeeting?.id);
  const isBusy = isCreatingMeeting || isExtractingActionItems || isConfirmingActionItems;
  const pipelineSteps = [
    { label: '회의 입력', isActive: !isMeetingCreated, isDone: isMeetingCreated },
    { label: '회의 생성', isActive: isMeetingCreated && extractedItems.length === 0, isDone: isMeetingCreated },
    { label: '액션 아이템 추출', isActive: extractedItems.length > 0, isDone: extractedItems.length > 0 },
  ];

  useEffect(() => {
    const projectContext = getStoredProjectContext();
    const projectId = projectContext?.projectId ?? '';

    if (!projectId || !isUuid(projectId)) {
      return;
    }

    let isMounted = true;

    const loadProjectMembers = async () => {
      try {
        const members = await getProjectMembers(projectId);

        if (isMounted) {
          setAssigneeOptions(members);
        }
      } catch (error) {
        console.error('[Meetings][Members:Failed]', {
          projectId,
          error,
        });
      }
    };

    void loadProjectMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateMeeting = async () => {
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

    setIsCreatingMeeting(true);
    setMessage('');
    setCreatedMeeting(null);
    setExtractedItems([]);

    try {
      const newMeeting = await createMeeting(projectId, {
        title: trimmedTitle,
        purpose: trimmedPurpose || null,
        raw_text: trimmedRawText || null,
      });

      console.log('[Meetings][CreateMeeting:OK]', {
        projectId,
        meeting: newMeeting,
      });

      if (!newMeeting.id) {
        setMessageTone('error');
        setMessage('회의는 생성되었지만 회의 ID를 확인할 수 없어 액션 아이템 추출을 진행할 수 없습니다.');
        return;
      }

      setCreatedMeeting(newMeeting);
      setMessageTone('success');
      setMessage('회의가 생성되었습니다. 이제 액션 아이템을 추출할 수 있습니다.');
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
      setIsCreatingMeeting(false);
    }
  };

  const handleExtractActionItems = async () => {
    const projectContext = getStoredProjectContext();
    const projectId = projectContext?.projectId ?? '';
    const meetingId = createdMeeting?.id ?? '';

    if (!meetingId) {
      setMessageTone('error');
      setMessage('먼저 회의를 생성해 주세요.');
      return;
    }

    if (!projectId || !isUuid(projectId)) {
      setMessageTone('error');
      setMessage('프로젝트 정보를 확인할 수 없습니다. 프로젝트에 다시 접속해 주세요.');
      return;
    }

    setIsExtractingActionItems(true);
    setMessage('');
    setExtractedItems([]);

    try {
      const requestedAt = new Date().toISOString();
      const extractedActionItems = await createAndFetchMeetingActionItems({
        projectId,
        meetingId,
        requestedAt,
        assigneeId: firstAssigneeId,
      });
      const draftItems = extractedActionItems.map((item) => toActionItemDraft(item, firstAssigneeId, assigneeOptions));

      setMessageTone('success');
      setMessage(draftItems.length > 0
        ? '액션 아이템 추출이 완료되었습니다.'
        : '액션 아이템 추출을 요청했지만 아직 표시할 항목이 없습니다.');
      setExtractedItems(draftItems);
    } catch (error) {
      console.error('[Meetings][ActionItems:ExtractFailed]', {
        projectId,
        meetingId,
        error,
      });
      setMessageTone('error');
      setMessage(getExtractActionItemsErrorMessage(error));
    } finally {
      setIsExtractingActionItems(false);
    }
  };

  const handleClear = () => {
    console.log('[Meetings] 지우기 버튼 클릭');
    setTitle('');
    setPurpose('');
    setRawText('');
    setMessage('');
    setCreatedMeeting(null);
    setExtractedItems([]);
    setHasConfirmedActionItems(false);
  };

  const handleItemChange = (
    itemId: string,
    field: keyof Omit<ExtractedActionItemDraft, 'id'>,
    value: string,
  ) => {
    setExtractedItems((items) =>
      items.map((item) =>
        item.id === itemId
          ? { ...item, [field]: value }
          : item,
      ),
    );
  };

  const handleAddItem = () => {
    if (hasConfirmedActionItems) {
      return;
    }

    setExtractedItems((items) => [
      ...items,
      {
        id: `draft-${Date.now()}`,
        description: '',
        assignee_id: firstAssigneeId,
        status: 'TODO',
        priority: 'DO',
        deadline: getFutureDate(7),
      },
    ]);
  };

  const handleDeleteItem = (itemId: string) => {
    if (hasConfirmedActionItems) {
      return;
    }

    setExtractedItems((items) => items.filter((item) => item.id !== itemId));
  };

  const handleConfirmActionItems = async () => {
    if (hasConfirmedActionItems) {
      return;
    }

    const meetingId = createdMeeting?.id ?? '';

    if (!meetingId) {
      setMessageTone('error');
      setMessage('먼저 회의를 생성해 주세요.');
      return;
    }

    const invalidItem = extractedItems.find((item) => !item.description.trim() || !item.assignee_id);

    if (invalidItem) {
      setMessageTone('error');
      setMessage('모든 액션 아이템의 세부 내용과 담당자를 입력해 주세요.');
      return;
    }

    setIsConfirmingActionItems(true);
    setMessage('');

    try {
      await Promise.all(
        extractedItems.map((item) => createActionItem(toActionItemCreateRequest(item, meetingId))),
      );

      setMessageTone('success');
      setMessage('액션 아이템이 확정되어 저장되었습니다.');
      setHasConfirmedActionItems(true);
    } catch (error) {
      console.error('[Meetings][ActionItems:ConfirmFailed]', {
        meetingId,
        error,
      });
      setMessageTone('error');
      setMessage('액션 아이템 저장에 실패했습니다. 입력값을 확인한 뒤 다시 시도해 주세요.');
    } finally {
      setIsConfirmingActionItems(false);
    }
  };

  const handleStartAdditionalMeeting = () => {
    setTitle('');
    setPurpose('');
    setRawText('');
    setMessage('');
    setCreatedMeeting(null);
    setExtractedItems([]);
    setHasConfirmedActionItems(false);
    navigate('/meetings');
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

      <div className="mb-6 grid gap-2 sm:grid-cols-3">
        {pipelineSteps.map((step, index) => (
          <div
            key={step.label}
            className={[
              'rounded-lg border px-3 py-2 text-sm transition',
              step.isActive ? 'border-primary/60 bg-primary/10 text-primary' : 'border-border bg-secondary/50 text-muted-foreground',
              step.isDone ? 'font-semibold' : '',
            ].join(' ')}
          >
            <span className="mr-2 font-mono text-xs">{index + 1}</span>
            {step.label}
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block" htmlFor="meeting-title">
          <span className="text-sm text-foreground">회의 제목</span>
          <input
            id="meeting-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isMeetingCreated}
            placeholder="예: MARS 기획 회의"
            className="mt-3 w-full rounded-lg border border-input bg-input-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/80 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
          />
        </label>

        <label className="block" htmlFor="meeting-purpose">
          <span className="text-sm text-foreground">회의 목적</span>
          <input
            id="meeting-purpose"
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            disabled={isMeetingCreated}
            placeholder="예: 액션 아이템 추출 및 담당자 정리"
            className="mt-3 w-full rounded-lg border border-input bg-input-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/80 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
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
          disabled={isMeetingCreated}
          placeholder={placeholder}
          className="mt-3 min-h-72 w-full resize-y rounded-lg border border-input bg-input-background px-4 py-4 text-sm leading-6 text-foreground placeholder:text-muted-foreground/80 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
        />
      </div>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleClear}
          disabled={isBusy}
          className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          지우기
        </button>
        <button
          type="button"
          onClick={handleCreateMeeting}
          disabled={isBusy || isMeetingCreated}
          className="rounded-lg border border-primary/50 px-5 py-2.5 text-sm text-primary transition hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCreatingMeeting ? '회의 생성 중...' : '회의 생성'}
        </button>
        <button
          type="button"
          onClick={handleExtractActionItems}
          disabled={isBusy || !isMeetingCreated}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExtractingActionItems ? '추출 중...' : '액션 아이템 추출'}
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

      <ExtractedActionItemsEditor
        items={extractedItems}
        assigneeOptions={assigneeOptions}
        onAddItem={handleAddItem}
        onDeleteItem={handleDeleteItem}
        onConfirmItems={handleConfirmActionItems}
        onStartAdditionalMeeting={handleStartAdditionalMeeting}
        onViewActionItems={() => navigate('/actions')}
        onItemChange={handleItemChange}
        isConfirming={isConfirmingActionItems}
        isConfirmed={hasConfirmedActionItems}
      />
    </section>
  );
}

const getExtractActionItemsErrorMessage = (error: unknown) => {
  if (error instanceof Error && (error.message.includes('초과') || error.message.toLowerCase().includes('timeout'))) {
    return 'AI 분석 시간이 길어지고 있습니다. 잠시 후 다시 추출을 시도해 주세요.';
  }

  return '액션 아이템 추출에 실패했습니다. 잠시 후 다시 시도해 주세요.';
};

const toActionItemCreateRequest = (
  item: ExtractedActionItemDraft,
  meetingId: string,
): ActionItemCreateRequest => {
  const priorityLevels = getPriorityLevels(item.priority);

  return {
    assignee_id: item.assignee_id,
    meeting_id: meetingId,
    description: item.description.trim(),
    status: item.status,
    priority: toNumericPriority(item.priority),
    importance: priorityLevels.importance,
    urgency: priorityLevels.urgency,
    deadline: toDeadlineISOString(item.deadline),
  };
};

const toNumericPriority = (priority: ExtractedActionItemDraft['priority']) => {
  if (priority === 'DO') {
    return 3;
  }

  if (priority === 'SCHEDULE' || priority === 'DELEGATE') {
    return 2;
  }

  return 1;
};

const getPriorityLevels = (priority: ExtractedActionItemDraft['priority']) => {
  if (priority === 'DO') {
    return { importance: 3, urgency: 3 };
  }

  if (priority === 'SCHEDULE') {
    return { importance: 3, urgency: 1 };
  }

  if (priority === 'DELEGATE') {
    return { importance: 1, urgency: 3 };
  }

  return { importance: 1, urgency: 1 };
};

const toDeadlineISOString = (deadline: string) => {
  if (!deadline) {
    return null;
  }

  const [year, month, date] = deadline.split('-').map(Number);
  const parsedDeadline = new Date(year, month - 1, date, 23, 59, 59, 999);

  if (Number.isNaN(parsedDeadline.getTime())) {
    return null;
  }

  return parsedDeadline.toISOString();
};

export default MeetingInputPanel;
