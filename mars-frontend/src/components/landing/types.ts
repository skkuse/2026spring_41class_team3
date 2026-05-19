export type LandingViewMode = 'landing' | 'create_project';

export interface ProjectNavigationState {
  userId: string;
  projectId: string;
  projectCode: string;
  title: string;
  role: 'admin';
}
