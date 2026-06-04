import { useEffect, useState } from 'react';
import PastMeetingsList from '../components/pastMeetings/PastMeetingsList';
import type { PastMeeting, PastMeetingDetail } from '../components/pastMeetings/types';
import { deleteMeeting, getMeeting, getProjectActionItems, getProjectMembers } from '../lib/api';
import type { ActionItemResponse, MeetingResponse } from '../lib/api';
import { getStoredProjectContext } from '../lib/projectContext';

function PastMeetings() {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<PastMeeting[]>([]);
  const [meetingDetails, setMeetingDetails] = useState<Record<string, PastMeetingDetail>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'success' | 'error'>('success');
  const storedProjectContext = getStoredProjectContext();
  const projectId = storedProjectContext?.projectId ?? '';
  const currentUserId = storedProjectContext?.userUuid ?? '';
  const projectContextErrorMessage = !projectId
    ? '프로젝트 정보를 확인할 수 없습니다. 프로젝트에 다시 접속해 주세요.'
    : !currentUserId
      ? '사용자 정보를 확인할 수 없습니다. 다시 접속한 뒤 시도해 주세요.'
      : '';

  const selectedDetail = selectedMeetingId
    ? (meetingDetails[selectedMeetingId] ?? null)
    : null;

  useEffect(() => {
    if (!projectId || !currentUserId) {
      return;
    }

    let isMounted = true;

    const loadPastMeetings = async () => {
      setIsLoading(true);
      setMessage('');

      try {
        const members = await getProjectMembers(projectId);
        const assigneeIds = members.map((member) => member.id);
        const actionItems = await loadProjectActionItemsByAssignees(
          projectId,
          assigneeIds.length > 0 ? assigneeIds : [currentUserId],
        );
        const meetingIds: string[] = Array.from(
          new Set(actionItems.map((item) => item.meeting_id).filter(isNonEmptyString)),
        );
        const meetingEntries = await Promise.all(
          meetingIds.map(async (meetingId) => {
            try {
              return [meetingId, await getMeeting(projectId, meetingId)] as const;
            } catch (error) {
              console.error('[PastMeetings][MeetingLoadFailed]', {
                projectId,
                meetingId,
                error,
              });
              return null;
            }
          }),
        );
        const meetingMap = Object.fromEntries(
          meetingEntries.filter((entry): entry is readonly [string, MeetingResponse] => entry !== null),
        );
        const remoteMeetings = buildPastMeetings(actionItems, meetingMap);
        const remoteDetails = buildPastMeetingDetails(remoteMeetings, meetingMap);

        if (!isMounted) {
          return;
        }

        setMeetings(remoteMeetings);
        setMeetingDetails(remoteDetails);
        setMessageTone('success');
        setMessage(remoteMeetings.length > 0 ? '' : '아직 조회된 지난 회의가 없습니다.');
      } catch (error) {
        console.error('[PastMeetings][LoadFailed]', {
          projectId,
          error,
        });

        if (!isMounted) {
          return;
        }

        setMeetings([]);
        setMeetingDetails({});
        setMessageTone('error');
        setMessage('지난 회의를 불러오지 못했습니다.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPastMeetings();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, projectId]);

  const handleSelectMeeting = (meetingId: string) => {
    if (selectedMeetingId === meetingId) {
      console.log('[PastMeetings] 지난 회의 상세 닫기', { meetingId });
      setSelectedMeetingId(null);
      return;
    }

    console.log('[PastMeetings][API] 지난 회의 상세 조회 클릭', {
      meetingId,
    });
    setSelectedMeetingId(meetingId);
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    const previousMeetings = meetings;
    const previousDetails = meetingDetails;

    setMeetings((items) => items.filter((meeting) => meeting.id !== meetingId));
    setMeetingDetails((details) => {
      const nextDetails = { ...details };
      delete nextDetails[meetingId];
      return nextDetails;
    });
    setSelectedMeetingId((selectedId) => (selectedId === meetingId ? null : selectedId));
    setMessage('');

    try {
      await deleteMeeting(meetingId);
      setMessageTone('success');
      setMessage('회의를 삭제했습니다.');
    } catch (error) {
      console.error('[PastMeetings][DeleteFailed]', {
        meetingId,
        error,
      });
      setMeetings(previousMeetings);
      setMeetingDetails(previousDetails);
      setMessageTone('error');
      setMessage('회의 삭제에 실패했습니다.');
    }
  };

  return (
    <main className="min-h-full bg-background px-6 py-8 text-foreground md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <h1 className="text-3xl text-primary">지난 회의</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            이전 회의의 내용과 추출된 액션 아이템 진행 현황을 확인하세요.
          </p>
        </header>

        {(message || projectContextErrorMessage) && (
          <p className={!projectContextErrorMessage && messageTone === 'success' ? 'text-sm text-emerald-500' : 'text-sm text-primary'}>
            {projectContextErrorMessage || message}
          </p>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
            지난 회의를 불러오는 중입니다.
          </div>
        ) : meetings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-secondary/40 p-10 text-center text-sm text-muted-foreground">
            아직 조회된 지난 회의가 없습니다.
          </div>
        ) : (
          <PastMeetingsList
            meetings={meetings}
            selectedMeetingId={selectedMeetingId}
            detail={selectedDetail}
            onSelectMeeting={handleSelectMeeting}
            onDeleteMeeting={handleDeleteMeeting}
          />
        )}
      </div>
    </main>
  );
}

const loadProjectActionItemsByAssignees = async (projectId: string, assigneeIds: string[]) => {
  const actionItemResults = await Promise.allSettled(
    assigneeIds
      .filter(Boolean)
      .map((assigneeId) => getProjectActionItems(projectId, { assignee_id: assigneeId })),
  );

  return dedupeActionItems(
    actionItemResults.flatMap((result) => (result.status === 'fulfilled' ? result.value : [])),
  );
};

const dedupeActionItems = (items: ActionItemResponse[]) => {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
};

const buildPastMeetings = (
  actionItems: ActionItemResponse[],
  meetingMap: Record<string, MeetingResponse>,
): PastMeeting[] => {
  const groupedActionItems = actionItems.reduce<Record<string, ActionItemResponse[]>>((acc, item) => {
    const meetingId = item.meeting_id;

    if (!meetingId) {
      return acc;
    }

    acc[meetingId] = [...(acc[meetingId] ?? []), item];
    return acc;
  }, {});

  return Object.entries(groupedActionItems)
    .map(([meetingId, meetingActionItems]) => {
      const meeting = meetingMap[meetingId];
      const createdAt = meeting?.date ?? meeting?.created_at ?? meetingActionItems[0]?.created_at ?? '';

      return {
        id: meetingId,
        title: meeting?.title ?? meeting?.name ?? '회의 정보 없음',
        date: formatDate(createdAt),
        actionItems: meetingActionItems.length,
        completed: meetingActionItems.filter((item) => isCompletedActionItem(item.status)).length,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
};

const buildPastMeetingDetails = (
  meetings: PastMeeting[],
  meetingMap: Record<string, MeetingResponse>,
): Record<string, PastMeetingDetail> => {
  return Object.fromEntries(
    meetings.map((meeting) => {
      const detail = meetingMap[meeting.id];

      return [
        meeting.id,
        {
          id: meeting.id,
          project_id: detail?.project_id ?? '',
          title: meeting.title,
          purpose: detail?.purpose ?? '회의 목적 정보가 없습니다.',
          raw_text: detail?.raw_text ?? '',
          summary: detail?.summary ?? detail?.raw_text ?? '회의 요약 정보가 없습니다.',
          qualitative_feedback: detail?.qualitative_feedback ?? '정성 피드백 정보가 없습니다.',
          productivity_score: detail?.productivity_score ?? 0,
          created_at: detail?.created_at ?? meeting.date,
          actionItems: meeting.actionItems,
          completed: meeting.completed,
        },
      ];
    }),
  );
};

const isCompletedActionItem = (status?: string | null) => {
  const normalizedStatus = status?.toLowerCase();

  return normalizedStatus === 'done' || normalizedStatus === 'completed' || normalizedStatus === 'complete';
};

const isNonEmptyString = (value?: string | null): value is string => {
  return typeof value === 'string' && value.length > 0;
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return '날짜 없음';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
};

export default PastMeetings;
