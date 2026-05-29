import { apiRequest } from './httpClient';

export interface CreateProjectRequest {
  name: string;
  owner_user_id: string;
  description: string | null;
  project_type: string | null;
  deadline: string | null;
}

export interface ProjectResponse {
  id: string;
  name: string;
  owner_id: string;
  description: string | null;
  project_type: string | null;
  deadline: string | null;
  created_at: string;
}

export const createProject = (body: CreateProjectRequest) => {
  return apiRequest<ProjectResponse>('/projects/', {
    method: 'POST',
    body,
  });
};
