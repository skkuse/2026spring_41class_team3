import { apiRequest } from './httpClient';

export interface CreateProjectRequest {
  name: string;
  owner_user_id: string;
  description: string;
  project_type: string;
  deadline: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  owner_id: string;
  description: string;
  project_type: string;
  deadline: string;
  created_at: string;
}

export const createProject = (body: CreateProjectRequest) => {
  return apiRequest<ProjectResponse>('/projects/', {
    method: 'POST',
    body,
  });
};
