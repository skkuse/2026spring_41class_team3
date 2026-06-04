import { apiRequest } from './httpClient';

export interface MeetingCreateRequest {
  title: string;
  purpose: string | null;
  raw_text: string | null;
}

export interface MeetingResponse {
  id: string;
  project_id?: string | null;
  title?: string | null;
  name?: string | null;
  purpose?: string | null;
  raw_text?: string | null;
  summary?: string | null;
  qualitative_feedback?: string | null;
  productivity_score?: number | null;
  created_at?: string | null;
  date?: string | null;
  next_agenda?: string[] | null;
  proposed_agendas?: string[] | null;
}

export const createMeeting = (projectId: string, body: MeetingCreateRequest) => {
  return apiRequest<MeetingResponse>(`/projects/${encodeURIComponent(projectId)}/meetings`, {
    method: 'POST',
    body,
  });
};

export const getMeeting = (projectId: string, meetingId: string) => {
  return apiRequest<MeetingResponse>(
    `/projects/${encodeURIComponent(projectId)}/meetings/${encodeURIComponent(meetingId)}`,
  );
};

export const deleteMeeting = (meetingId: string) => {
  return apiRequest<unknown>(`/meetings/${encodeURIComponent(meetingId)}`, {
    method: 'DELETE',
  });
};
