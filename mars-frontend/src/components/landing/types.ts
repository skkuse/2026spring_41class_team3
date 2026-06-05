export type LandingViewMode = 'landing' | 'create_project';
export type UserIdentityMode = 'access' | 'create';

export interface ProjectNavigationState {
  userId: string;
  userName: string;
  userUuid: string;
  projectId: string;
  projectCode: string;
  title: string;
  role?: 'admin' | 'member';
}

export interface UserIdentity {
  id: string;
  name: string;
  uuid: string;
}
