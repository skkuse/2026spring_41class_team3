export interface PastMeeting {
  id: string;
  title: string;
  date: string;
  actionItems: number;
  completed: number;
}

export interface PastMeetingDetail {
  id: string;
  project_id: string;
  title: string;
  purpose: string;
  raw_text: string;
  summary: string;
  qualitative_feedback: string;
  productivity_score: number;
  created_at: string;
}
