import type { ActionItemPriority, ActionItemStatus, User } from '../actionItems/types';
import { createMeetingActionItems, getProjectActionItems } from '../../lib/api';
import type { ActionItemResponse, MeetingAnalyzeActionItem } from '../../lib/api';

export interface ExtractedActionItemDraft {
  id: string;
  description: string;
  assignee_id: string;
  status: ActionItemStatus;
  priority: ActionItemPriority;
  deadline: string;
}

export const fetchExtractedActionItems = async ({
  projectId,
  meetingId,
  requestedAt,
  assigneeId,
}: {
  projectId: string;
  meetingId?: string;
  requestedAt: string;
  assigneeId?: string;
}) => {
  const maxAttempts = 4;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (attempt > 0) {
      await delay(800);
    }

    const actionItems = await getProjectActionItems(projectId, {
      assignee_id: assigneeId,
      sort: 'created_at',
    });
    const extractedItems = filterExtractedActionItems(actionItems, meetingId, requestedAt);

    if (extractedItems.length > 0 || attempt === maxAttempts - 1) {
      return extractedItems;
    }
  }

  return [];
};

export const createAndFetchMeetingActionItems = async ({
  projectId,
  meetingId,
  requestedAt,
  assigneeId,
}: {
  projectId: string;
  meetingId: string;
  requestedAt: string;
  assigneeId?: string;
}) => {
  const analyzedMeeting = await createMeetingActionItems(meetingId);
  const fallbackItems = (analyzedMeeting.action_items ?? []).map((item, index) =>
    toActionItemResponseFallback(item, meetingId, index),
  );

  try {
    const fetchedItems = await fetchExtractedActionItems({
      projectId,
      meetingId,
      requestedAt,
      assigneeId,
    });

    if (fetchedItems.length > 0) {
      return fetchedItems;
    }
  } catch (error) {
    console.error('[Meetings][ActionItems:FetchAfterAnalyzeFailed]', {
      projectId,
      meetingId,
      error,
    });
  }

  return fallbackItems;
};

export const toActionItemDraft = (
  item: ActionItemResponse,
  fallbackAssigneeId: string,
  assigneeOptions: User[] = [],
): ExtractedActionItemDraft => {
  const parsedTask = parseAssigneeTask(item.description ?? '', assigneeOptions, fallbackAssigneeId);

  return {
    id: item.id,
    description: parsedTask.description,
    assignee_id: parsedTask.hasAssigneePrefix ? parsedTask.assigneeId : item.assignee_id ?? parsedTask.assigneeId,
    status: toActionItemStatus(item.status),
    priority: toActionItemPriority(item.priority, item.importance, item.urgency),
    deadline: formatDateInputValue(item.deadline) || getFutureDate(7),
  };
};

export const getFutureDate = (daysToAdd: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);

  return date.toISOString().slice(0, 10);
};

export const isUuid = (value: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
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

const toActionItemResponseFallback = (
  item: MeetingAnalyzeActionItem,
  meetingId: string,
  index: number,
): ActionItemResponse => {
  return {
    id: `generated-${meetingId}-${index}`,
    meeting_id: meetingId,
    description: item.task,
    priority: item.priority,
    status: 'TODO',
    created_at: new Date().toISOString(),
  };
};

const parseAssigneeTask = (
  description: string,
  assigneeOptions: User[],
  fallbackAssigneeId: string,
) => {
  const taskMatch = description.match(/^([^:：\-–—]+)\s*[:：\-–—]\s*(.+)$/);

  if (!taskMatch) {
    return {
      assigneeId: fallbackAssigneeId,
      description,
      hasMatchedAssignee: false,
      hasAssigneePrefix: false,
    };
  }

  const assigneeName = taskMatch[1].trim();
  const taskDescription = taskMatch[2].trim();
  const matchedAssignee = assigneeOptions.find((user) => user.name === assigneeName);

  return {
    assigneeId: matchedAssignee?.id ?? fallbackAssigneeId,
    description: taskDescription,
    hasMatchedAssignee: Boolean(matchedAssignee),
    hasAssigneePrefix: true,
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
    if (priority <= 1) {
      return 'DO';
    }

    if (priority === 2) {
      return 'SCHEDULE';
    }

    if (priority === 3) {
      return 'DELEGATE';
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
