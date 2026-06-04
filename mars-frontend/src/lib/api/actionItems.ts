import { apiRequest } from './httpClient';

export interface ActionItemResponse {
  id: string;
  meeting_id?: string | null;
  assignee_id?: string | null;
  description?: string | null;
  priority?: number | null;
  urgency?: number | null;
  importance?: number | null;
  status?: string | null;
  deadline?: string | null;
  created_at?: string | null;
}

export interface MeetingAnalyzeActionItem {
  task: string;
  priority: number;
}

export interface MeetingAnalyzeResponse {
  meeting_id: string;
  summary: string;
  action_items: MeetingAnalyzeActionItem[];
  qualitative_feedback: string;
  next_agenda: string[];
}

export interface GetProjectActionItemsParams {
  status?: string;
  assignee_id?: string;
  sort?: string;
}

export const createMeetingActionItems = (meetingId: string) => {
  return apiRequest<MeetingAnalyzeResponse>(
    `/meetings/${encodeURIComponent(meetingId)}/analyze`,
    {
      method: 'POST',
      timeoutMs: 120000,
    },
  );
};

export const getProjectActionItems = (projectId: string, params: GetProjectActionItemsParams = {}) => {
  const query = new URLSearchParams();

  if (params.status) {
    query.set('status', params.status);
  }

  if (params.assignee_id) {
    query.set('assignee_id', params.assignee_id);
  }

  if (params.sort) {
    query.set('sort', params.sort);
  }

  const queryString = query.toString();
  const path = `/projects/${encodeURIComponent(projectId)}/action-items${queryString ? `?${queryString}` : ''}`;

  return apiRequest<ActionItemResponse[]>(path);
};
