import { apiRequest } from './httpClient';

export interface AgendaCreateRequest {
  proposed_agendas: string[];
}

export const createAgenda = (projectId: string, body: AgendaCreateRequest) => {
  return apiRequest<unknown>(`/projects/${encodeURIComponent(projectId)}/agendas`, {
    method: 'POST',
    body,
  });
};
