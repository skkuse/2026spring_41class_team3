import { apiRequest } from './httpClient';

export interface ActionItemResponse {
  id: string;
  meeting_id?: string | null;
  assignee_id?: string | null;
  description?: string | null;
  priority?: string | null;
  urgency?: string | null;
  importance?: string | null;
  status?: string | null;
  deadline?: string | null;
  created_at?: string | null;
}

export interface GetProjectActionItemsParams {
  status?: string;
  assignee_id?: string;
  sort?: string;
}

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
