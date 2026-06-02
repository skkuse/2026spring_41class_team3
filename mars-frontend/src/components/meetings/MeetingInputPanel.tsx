import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { matrixQuadrants, statusColumns } from '../actionItems/actionItemConfig';
import type { ActionItemPriority, ActionItemStatus, User } from '../actionItems/types';
import { usersData } from '../actionItems/usersData';
import { createMeeting, getProjectActionItems, getProjectMembers } from '../../lib/api';
import type { ActionItemResponse } from '../../lib/api';
import { getStoredProjectContext } from '../../lib/projectContext';

// import UploadOptionCard from './UploadOptionCard';

const placeholder = `이곳에 입력해주세요.`;
const defaultAssigneeId = usersData[0]?.id ?? '';

interface ExtractedActionItemDraft {
  id: string;
  description: string;
  assignee_id: string;
  status: ActionItemStatus;
  priority: ActionItemPriority;
  deadline: string;
}

function MeetingInputPanel() {
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [rawText, setRawText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'success' | 'error'>('success');
  const [extractedItems, setExtractedItems] = useState<ExtractedActionItemDraft[]>([]);
  const [assigneeOptions, setAssigneeOptions] = useState<User[]>(usersData);
  const firstAssigneeId = assigneeOptions[0]?.id ?? defaultAssigneeId;

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

        if (isMounted && members.length > 0) {
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
    setExtractedItems([]);

    try {
      const requestedAt = new Date().toISOString();
      const createdMeeting = await createMeeting(projectId, {
        title: trimmedTitle,
        purpose: trimmedPurpose || null,
        raw_text: trimmedRawText || null,
      });

      console.log('[Meetings][CreateMeeting:OK]', {
        projectId,
        meeting: createdMeeting,
      });
      const extractedActionItems = await fetchExtractedActionItems({
        projectId,
        meetingId: createdMeeting.id,
        requestedAt,
      });
      const draftItems = extractedActionItems.map((item) => toActionItemDraft(item, firstAssigneeId));

      setMessageTone('success');
      setMessage(draftItems.length > 0
        ? '회의가 생성되었고 추출된 액션 아이템을 불러왔습니다.'
        : '회의가 생성되었습니다. 아직 추출된 액션 아이템이 없습니다.');
      setExtractedItems(draftItems);
    } catch (error) {
      console.error('[Meetings][CreateMeeting:Failed]', {
        projectId,
        title: trimmedTitle,
        purpose: trimmedPurpose || null,
        raw_text: trimmedRawText || null,
        error,
      });
      setMessageTone('error');
      setMessage('회의 생성 또는 액션 아이템 조회에 실패했습니다. 입력값과 프로젝트 정보를 확인해 주세요.');
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
    setExtractedItems([]);
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
    setExtractedItems((items) => items.filter((item) => item.id !== itemId));
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

      <div className="mt-8 border-t border-border pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl text-foreground">추출된 액션 아이템 검토</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              설명, 담당자, 상태, 우선순위, 마감일을 확인하고 수정하세요.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground transition hover:border-primary/50 hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
            항목 추가
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {extractedItems.length > 0 ? (
            extractedItems.map((item, index) => (
              <article
                key={item.id}
                className="rounded-lg border border-border bg-secondary/60 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-sm font-semibold text-primary">
                    {index + 1}
                  </div>

                  <label className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-muted-foreground">세부 내용</span>
                    <textarea
                      value={item.description}
                      onChange={(event) => handleItemChange(item.id, 'description', event.target.value)}
                      rows={2}
                      placeholder="액션 아이템 내용을 입력하세요."
                      className="mt-1 min-h-16 w-full resize-y rounded-md border border-input bg-input-background px-3 py-2 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-ring"
                    />
                  </label>

                  <button
                    type="button"
                    aria-label="액션 아이템 삭제"
                    onClick={() => handleDeleteItem(item.id)}
                    className="mt-5 rounded-md p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-4">
                  <label className="block">
                    <span className="text-xs font-semibold text-muted-foreground">담당자</span>
                    <select
                      value={item.assignee_id}
                      onChange={(event) => handleItemChange(item.id, 'assignee_id', event.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                    >
                      {assigneeOptions.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold text-muted-foreground">상태</span>
                    <select
                      value={item.status}
                      onChange={(event) => handleItemChange(item.id, 'status', event.target.value as ActionItemStatus)}
                      className="mt-1 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                    >
                      {statusColumns.map((status) => (
                        <option key={status.key} value={status.key}>
                          {status.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold text-muted-foreground">우선순위</span>
                    <select
                      value={item.priority}
                      onChange={(event) => handleItemChange(item.id, 'priority', event.target.value as ActionItemPriority)}
                      className="mt-1 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                    >
                      {matrixQuadrants.map((priority) => (
                        <option key={priority.key} value={priority.key}>
                          {priority.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-xs font-semibold text-muted-foreground">마감일</span>
                    <input
                      type="date"
                      value={item.deadline}
                      onChange={(event) => handleItemChange(item.id, 'deadline', event.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                    />
                  </label>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-secondary/40 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                회의록을 입력하고 액션 아이템 생성을 누르면 추출 결과를 여기에서 검토할 수 있습니다.
              </p>
            </div>
          )}
        </div>

        {extractedItems.length > 0 && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
            >
              임시 저장
            </button>
            <button
              type="button"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground transition hover:bg-primary/90"
            >
              수정 내용 확정
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

const fetchExtractedActionItems = async ({
  projectId,
  meetingId,
  requestedAt,
}: {
  projectId: string;
  meetingId?: string;
  requestedAt: string;
}) => {
  const maxAttempts = 4;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (attempt > 0) {
      await delay(800);
    }

    const actionItems = await getProjectActionItems(projectId, {
      sort: 'created_at',
    });
    const extractedItems = filterExtractedActionItems(actionItems, meetingId, requestedAt);

    if (extractedItems.length > 0 || attempt === maxAttempts - 1) {
      return extractedItems;
    }
  }

  return [];
};

const filterExtractedActionItems = (
  actionItems: ActionItemResponse[],
  meetingId: string | undefined,
  requestedAt: string,
) => {
  if (meetingId) {
    return actionItems.filter((item) => item.meeting_id === meetingId);
  }

  const requestedTime = new Date(requestedAt).getTime();

  return actionItems.filter((item) => {
    const createdTime = item.created_at ? new Date(item.created_at).getTime() : 0;

    return createdTime >= requestedTime;
  });
};

const toActionItemDraft = (
  item: ActionItemResponse,
  fallbackAssigneeId: string,
): ExtractedActionItemDraft => {
  return {
    id: item.id,
    description: item.description ?? '',
    assignee_id: item.assignee_id ?? fallbackAssigneeId,
    status: toActionItemStatus(item.status),
    priority: toActionItemPriority(item.priority, item.importance, item.urgency),
    deadline: formatDateInputValue(item.deadline) || getFutureDate(7),
  };
};

const toActionItemStatus = (status?: string | null): ActionItemStatus => {
  const normalizedStatus = status?.toUpperCase();

  if (normalizedStatus === 'DONE' || normalizedStatus === 'IN_PROGRESS' || normalizedStatus === 'TODO') {
    return normalizedStatus;
  }

  return 'TODO';
};

const toActionItemPriority = (
  priority?: number | null,
  importance?: number | null,
  urgency?: number | null,
): ActionItemPriority => {
  if (priority !== null && priority !== undefined) {
    if (priority >= 3) {
      return 'DO';
    }

    if (priority <= 1) {
      return 'DELETE';
    }
  }

  if ((importance ?? 0) >= 2 && (urgency ?? 0) >= 2) {
    return 'DO';
  }

  if ((importance ?? 0) >= 2) {
    return 'SCHEDULE';
  }

  if ((urgency ?? 0) >= 2) {
    return 'DELEGATE';
  }

  return 'DELETE';
};

const formatDateInputValue = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
};

const delay = (ms: number) => {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
};

const getFutureDate = (daysToAdd: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);

  return date.toISOString().slice(0, 10);
};

const isUuid = (value: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

export default MeetingInputPanel;
