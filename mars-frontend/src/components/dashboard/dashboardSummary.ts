import { actionItems } from '../actionItems/actionItemsData';
import { pastMeetings } from '../pastMeetings/pastMeetingsData';
import type { ActionItemResponse, MeetingResponse } from '../../lib/api';
import type { DashboardMeeting, DashboardSummary } from './types';

interface DashboardActionItemLike {
  meeting_id?: string | null;
  status?: string | null;
}

export const buildDashboardSummary = ({
  hasLoadedRemoteData,
  remoteActionItems,
  remoteMeetings,
}: {
  hasLoadedRemoteData: boolean;
  remoteActionItems: ActionItemResponse[];
  remoteMeetings: Record<string, MeetingResponse>;
}): DashboardSummary => {
  const dashboardActionItems = hasLoadedRemoteData ? remoteActionItems : actionItems;
  const totalActionItems = dashboardActionItems.length;
  const completedActionItems = dashboardActionItems.filter((item) => isCompletedActionItem(item.status)).length;
  const progressRate = totalActionItems === 0 ? 0 : Math.round((completedActionItems / totalActionItems) * 100);
  const recentMeetings = hasLoadedRemoteData
    ? buildRemoteMeetingSummaries(remoteActionItems, remoteMeetings)
    : buildFallbackMeetingSummaries(dashboardActionItems);

  return {
    totalActionItems,
    completedActionItems,
    progressRate,
    recentMeetings: recentMeetings.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4),
  };
};

export const isCompletedActionItem = (status?: string | null) => {
  const normalizedStatus = status?.toLowerCase();

  return normalizedStatus === 'done' || normalizedStatus === 'completed' || normalizedStatus === 'complete';
};

const buildFallbackMeetingSummaries = (dashboardActionItems: DashboardActionItemLike[]): DashboardMeeting[] => {
  return pastMeetings.map((meeting) => {
    const relatedActionItems = dashboardActionItems.filter((item) => item.meeting_id === meeting.id);
    const actionItemCount = relatedActionItems.length || meeting.actionItems;
    const completedCount = relatedActionItems.length
      ? relatedActionItems.filter((item) => isCompletedActionItem(item.status)).length
      : meeting.completed;
    const completionRate = actionItemCount === 0 ? 0 : Math.round((completedCount / actionItemCount) * 100);

    return {
      ...meeting,
      items: actionItemCount,
      done: completedCount,
      pct: `${completionRate}%`,
    };
  });
};

const buildRemoteMeetingSummaries = (
  dashboardActionItems: ActionItemResponse[],
  meetingMap: Record<string, MeetingResponse>,
): DashboardMeeting[] => {
  const groupedActionItems = dashboardActionItems.reduce<Record<string, ActionItemResponse[]>>((acc, item) => {
    const meetingId = item.meeting_id ?? 'unassigned';
    acc[meetingId] = [...(acc[meetingId] ?? []), item];
    return acc;
  }, {});

  return Object.entries(groupedActionItems).map(([meetingId, meetingActionItems]) => {
    const meeting = meetingMap[meetingId];
    const actionItemCount = meetingActionItems.length;
    const completedCount = meetingActionItems.filter((item) => isCompletedActionItem(item.status)).length;
    const completionRate = actionItemCount === 0 ? 0 : Math.round((completedCount / actionItemCount) * 100);
    const createdAt = meeting?.date ?? meeting?.created_at ?? meetingActionItems[0]?.created_at ?? '';

    return {
      id: meetingId,
      title: meeting?.title ?? meeting?.name ?? meetingActionItems[0]?.description ?? '회의 정보 없음',
      date: formatDashboardDate(createdAt),
      items: actionItemCount,
      done: completedCount,
      pct: `${completionRate}%`,
    };
  });
};

const formatDashboardDate = (value?: string | null) => {
  if (!value) {
    return '날짜 없음';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
};
