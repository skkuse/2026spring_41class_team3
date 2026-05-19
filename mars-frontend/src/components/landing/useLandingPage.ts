import type * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, createProject } from '../../lib/api';
import type { LandingViewMode, ProjectNavigationState, UserIdentity, UserIdentityMode } from './types';

const USER_ID_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,}$/;
const USER_REGISTRY_STORAGE_KEY = 'mars:user-registry';
const CURRENT_USER_STORAGE_KEY = 'mars:current-user';

const toApiErrorMessage = (error: unknown) => {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }

  return '프로젝트 생성 중 오류가 발생했습니다.';
};

const readUserRegistry = () => {
  const storedRegistry = window.localStorage.getItem(USER_REGISTRY_STORAGE_KEY);

  if (!storedRegistry) {
    return {} as Record<string, string>;
  }

  try {
    return JSON.parse(storedRegistry) as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
};

const readCurrentUser = () => {
  const storedUser = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as UserIdentity;
  } catch {
    return null;
  }
};

const saveUserIdentity = (user: UserIdentity) => {
  const registry = readUserRegistry();
  const nextRegistry = {
    ...registry,
    [user.id]: user.uuid,
  };

  window.localStorage.setItem(USER_REGISTRY_STORAGE_KEY, JSON.stringify(nextRegistry));
  window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
};

const validateUserId = (value: string) => {
  if (!value) {
    return '';
  }

  if (!USER_ID_PATTERN.test(value)) {
    return '아이디는 영문과 숫자를 조합해 3자 이상으로 입력해야 합니다.';
  }

  return '';
};

export const useLandingPage = () => {
  const navigate = useNavigate();
  const initialUser = readCurrentUser();

  const [viewMode, setViewMode] = useState<LandingViewMode>('landing');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [identityMode, setIdentityMode] = useState<UserIdentityMode>('access');
  const [currentUser, setCurrentUser] = useState<UserIdentity | null>(initialUser);
  const [existingUser, setExistingUser] = useState<UserIdentity | null>(null);
  const [userIdInput, setUserIdInput] = useState(initialUser?.id ?? '');
  const [projectCode, setProjectCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectType, setProjectType] = useState('');
  const [projectDeadline, setProjectDeadline] = useState('');

  const [userIdWarning, setUserIdWarning] = useState('');
  const [duplicateCheckMessage, setDuplicateCheckMessage] = useState(
    '',
  );
  const [errorMessage, setErrorMessage] = useState('');

  const [createdProjectId, setCreatedProjectId] = useState('');
  const [pendingNavigateData, setPendingNavigateData] = useState<ProjectNavigationState | null>(null);

  const resetCreateProjectForm = () => {
    setErrorMessage('');
    setProjectName('');
    setProjectDescription('');
    setProjectType('');
    setProjectDeadline('');
  };

  const goToLanding = () => {
    setViewMode('landing');
    setErrorMessage('');
  };

  const handleCreateProjectClick = () => {
    if (!currentUser) {
      setDuplicateCheckMessage('먼저 사용자 아이디로 접속하거나 새 아이디를 만들어 주세요.');
      return;
    }

    resetCreateProjectForm();
    setViewMode('create_project');
  };

  const handleUserIdInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    setUserIdInput(value);
    setUserIdWarning(validateUserId(value));
    setDuplicateCheckMessage('');
    setExistingUser(null);

    if (currentUser && currentUser.id !== value) {
      setCurrentUser(null);
    }
  };

  const handleCheckDuplicate = () => {
    const normalizedUserId = userIdInput.trim();
    const warning = validateUserId(normalizedUserId);

    setUserIdWarning(warning);

    if (warning || !normalizedUserId) {
      setDuplicateCheckMessage('');
      setCurrentUser(null);
      setExistingUser(null);
      return;
    }

    const registry = readUserRegistry();
    const registeredUuid = registry[normalizedUserId];

    if (registeredUuid) {
      setExistingUser(null);
      setCurrentUser(null);
      setDuplicateCheckMessage('이미 사용 중인 아이디입니다. 접속하기를 이용해 주세요.');
      return;
    }

    const user = {
      id: normalizedUserId,
      uuid: registeredUuid ?? crypto.randomUUID(),
    };

    saveUserIdentity(user);
    setExistingUser(null);
    setCurrentUser(user);
    setDuplicateCheckMessage('새 아이디가 생성되었습니다.');
  };

  const handleAccessExistingUser = () => {
    const normalizedUserId = userIdInput.trim();
    const warning = validateUserId(normalizedUserId);

    setUserIdWarning(warning);

    if (warning || !normalizedUserId) {
      setDuplicateCheckMessage('');
      setExistingUser(null);
      return;
    }

    const registry = readUserRegistry();
    const registeredUuid = registry[normalizedUserId];

    if (!registeredUuid) {
      setExistingUser(null);
      setCurrentUser(null);
      setDuplicateCheckMessage('등록된 아이디가 없습니다.');
      return;
    }

    const user = {
      id: normalizedUserId,
      uuid: registeredUuid,
    };

    saveUserIdentity(user);
    setExistingUser(user);
    setCurrentUser(user);
    setDuplicateCheckMessage('기존 아이디로 접속되었습니다.');
  };

  const handleSwitchToCreateUser = () => {
    setIdentityMode('create');
    setCurrentUser(null);
    setExistingUser(null);
    setUserIdWarning(validateUserId(userIdInput));
    setDuplicateCheckMessage('');
  };

  const handleSwitchToAccessUser = () => {
    setIdentityMode('access');
    setCurrentUser(null);
    setExistingUser(null);
    setUserIdWarning(validateUserId(userIdInput));
    setDuplicateCheckMessage('');
  };

  const handleProjectCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectCode(event.target.value.replace(/[^0-9]/g, ''));
  };

  const handleOpenJoinModal = () => {
    if (!currentUser) {
      setDuplicateCheckMessage('먼저 사용자 아이디로 접속하거나 새 아이디를 만들어 주세요.');
      return;
    }

    setErrorMessage('');
    setProjectCode('');
    setIsJoinModalOpen(true);
  };

  const handleCloseJoinModal = () => {
    setIsJoinModalOpen(false);
  };

  const handleJoinSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentUser) {
      setErrorMessage('먼저 사용자 아이디로 접속하거나 새 아이디를 만들어 주세요.');
      return;
    }

    if (projectCode.length !== 10) {
      setErrorMessage('코드는 정확히 10자리 숫자여야 합니다.');
      return;
    }

    setErrorMessage('');
    setIsJoinModalOpen(false);
    navigate('/dashboard', {
      state: {
        userId: currentUser.id,
        userUuid: currentUser.uuid,
        projectCode,
      },
    });
  };

  const handleCreateProjectSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentUser) {
      setErrorMessage('먼저 사용자 아이디로 접속하거나 새 아이디를 만들어 주세요.');
      return;
    }

    if (!projectName.trim()) {
      setErrorMessage('프로젝트 이름을 입력해 주세요.');
      return;
    }

    if (!projectDescription.trim()) {
      setErrorMessage('프로젝트 설명을 입력해 주세요.');
      return;
    }

    if (!projectType.trim()) {
      setErrorMessage('프로젝트 유형을 입력해 주세요.');
      return;
    }

    const deadlineDate = new Date(projectDeadline);

    if (!projectDeadline || Number.isNaN(deadlineDate.getTime())) {
      setErrorMessage('마감일을 올바르게 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const createdProject = await createProject({
        name: projectName.trim(),
        owner_user_id: currentUser.uuid,
        description: projectDescription.trim(),
        project_type: projectType.trim(),
        deadline: deadlineDate.toISOString(),
      });

      setCreatedProjectId(createdProject.id);
      setIsCopied(false);
      setPendingNavigateData({
        userId: currentUser.id,
        userUuid: currentUser.uuid,
        projectId: createdProject.id,
        projectCode: createdProject.id,
        title: createdProject.name,
        role: 'admin',
      });
      setIsSuccessModalOpen(true);
    } catch (error) {
      setErrorMessage(toApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(createdProjectId);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('코드 복사에 실패했습니다.', error);
    }
  };

  const handleCloseSuccessAndNavigate = () => {
    setIsSuccessModalOpen(false);

    if (pendingNavigateData) {
      navigate('/dashboard', { state: pendingNavigateData });
    }
  };

  return {
    state: {
      viewMode,
      isJoinModalOpen,
      isSuccessModalOpen,
      isLoading,
      isCopied,
      identityMode,
      currentUser,
      existingUser,
      userIdInput,
      projectCode,
      projectName,
      projectDescription,
      projectType,
      projectDeadline,
      userIdWarning,
      duplicateCheckMessage,
      errorMessage,
      createdProjectId,
    },
    actions: {
      goToLanding,
      handleCreateProjectClick,
      handleOpenJoinModal,
      handleCloseJoinModal,
      handleUserIdInputChange,
      handleCheckDuplicate,
      handleAccessExistingUser,
      handleSwitchToCreateUser,
      handleSwitchToAccessUser,
      handleProjectCodeChange,
      handleJoinSubmit,
      setProjectName,
      setProjectDescription,
      setProjectType,
      setProjectDeadline,
      handleCreateProjectSubmit,
      handleCopyCode,
      handleCloseSuccessAndNavigate,
    },
  };
};
