import { apiRequest } from './httpClient';

export interface UserAvailabilityResponse {
  available: boolean;
}

export interface CreateUserRequest {
  username: string;
  name: string;
  role: string | null;
}

export interface UserResponse {
  id: string;
  project_id: string | null;
  username: string;
  name: string;
  role: string | null;
  joined_at: string;
  created_at: string;
}

export interface UserProjectResponse {
  id: string;
  project_code: string;
  name: string;
}

export const checkUserAvailability = (username: string) => {
  const query = new URLSearchParams({ username });

  return apiRequest<UserAvailabilityResponse>(`/users/availability?${query.toString()}`);
};

export const createUser = (body: CreateUserRequest) => {
  return apiRequest<UserResponse>('/users/', {
    method: 'POST',
    body,
  });
};

export const loginUser = (username: string) => {
  const query = new URLSearchParams({ username });

  return apiRequest<UserResponse>(`/users/login?${query.toString()}`, {
    method: 'POST',
  });
};

export const getUserProjects = (userId: string) => {
  return apiRequest<UserProjectResponse[]>(`/users/${encodeURIComponent(userId)}/projects`);
};
