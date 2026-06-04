const PROJECT_CONTEXT_STORAGE_KEY = 'mars_project_context';

export interface ProjectContext {
  userId: string;
  userUuid: string;
  projectId: string;
  projectCode: string;
  projectTitle: string;
}

export const setStoredProjectContext = (context: ProjectContext) => {
  window.sessionStorage.setItem(PROJECT_CONTEXT_STORAGE_KEY, JSON.stringify(context));
};

export const getStoredProjectContext = (): ProjectContext | null => {
  const rawContext = window.sessionStorage.getItem(PROJECT_CONTEXT_STORAGE_KEY);

  if (!rawContext) {
    return null;
  }

  try {
    const context = JSON.parse(rawContext) as Partial<ProjectContext>;

    if (
      typeof context.userId === 'string'
      && typeof context.userUuid === 'string'
      && typeof context.projectId === 'string'
      && typeof context.projectCode === 'string'
      && typeof context.projectTitle === 'string'
    ) {
      return {
        userId: context.userId,
        userUuid: context.userUuid,
        projectId: context.projectId,
        projectCode: context.projectCode,
        projectTitle: context.projectTitle,
      };
    }
  } catch {
    return null;
  }

  return null;
};

export const clearStoredProjectContext = () => {
  window.sessionStorage.removeItem(PROJECT_CONTEXT_STORAGE_KEY);
};
