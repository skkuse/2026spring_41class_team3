import { apiRequest } from './httpClient';

export interface AgendaCreateRequest {
  proposed_agendas: string[];
}

export interface AgendaResponse {
  id: string;
  project_id: string;
  meeting_id?: string | null;
  meetingId?: string | null;
  source_meeting_id?: string | null;
  sourceMeetingId?: string | null;
  proposed_agendas: unknown[];
  is_adopted?: boolean | null;
  created_at?: string | null;
}

export const createAgenda = (projectId: string, body: AgendaCreateRequest) => {
  return apiRequest<unknown>(`/projects/${encodeURIComponent(projectId)}/agendas`, {
    method: 'POST',
    body,
  });
};

export const getProposedAgendas = (projectId: string) => {
  return apiRequest<AgendaResponse[]>(
    `/projects/${encodeURIComponent(projectId)}/agendas/proposed`,
  );
};
