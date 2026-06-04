export interface DashboardMeeting {
  id: string;
  title: string;
  date: string;
  items: number;
  done: number;
  pct: string;
}

export interface DashboardSummary {
  totalActionItems: number;
  completedActionItems: number;
  progressRate: number;
  recentMeetings: DashboardMeeting[];
}
