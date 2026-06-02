import { apiRequest } from './httpClient';

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
}

export const getMeeting = (projectId: string, meetingId: string) => {
  return apiRequest<MeetingResponse>(
    `/projects/${encodeURIComponent(projectId)}/meetings/${encodeURIComponent(meetingId)}`,
  );
};
