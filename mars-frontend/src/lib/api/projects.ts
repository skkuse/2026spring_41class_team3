import { apiRequest } from './httpClient';

export interface CreateProjectRequest {
  name: string;
  owner_user_id: string;
  description: string | null;
  project_type: string | null;
  deadline: string | null;
}

export interface JoinProjectRequest {
  project_code: string;
  user_id: string;
}

export interface ProjectResponse {
  id: string;
  project_code: string;
  name: string;
  owner_id: string;
  description: string | null;
  project_type: string | null;
  deadline: string | null;
  created_at: string;
}

export interface JoinProjectResponse {
  project_id: string;
  // TODO: /projects/join 응답에 프로젝트 이름과 10자리 코드가 추가되면
  // project_name/project_code 필드를 타입에 추가하고 대시보드 state에 연결한다.
  user_id: string;
  joined_at: string;
}

export const createProject = (body: CreateProjectRequest) => {
  return apiRequest<ProjectResponse>('/projects/', {
    method: 'POST',
    body,
  });
};

export const joinProject = (body: JoinProjectRequest) => {
  return apiRequest<JoinProjectResponse>('/projects/join', {
    method: 'POST',
    body,
  });
};
