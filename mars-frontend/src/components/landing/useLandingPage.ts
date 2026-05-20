import type * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, checkUserAvailability, createUser, loginUser } from '../../lib/api';
import type { UserResponse } from '../../lib/api';
import type { LandingViewMode, ProjectNavigationState, UserIdentity, UserIdentityMode } from './types';

const USER_ID_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,}$/;

const validateUserId = (value: string) => {
  if (!value) {
    return '';
  }

  if (!USER_ID_PATTERN.test(value)) {
    return '아이디는 영문과 숫자를 조합해 3자 이상으로 입력해야 합니다.';
  }

  return '';
};

const getNetworkErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('timeout') || message.includes('초과')) {
      return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.';
    }

    if (message.includes('failed to fetch') || message.includes('network')) {
      return '서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.';
    }
  }

  return '';
};

const toUserIdentity = (user: UserResponse): UserIdentity => ({
  id: user.username,
  name: user.name,
  uuid: user.id,
});

const getAvailabilityErrorMessage = (error: unknown) => {
  if (error instanceof ApiError && error.status === 422) {
    return '아이디 형식이 올바르지 않습니다. 입력값을 다시 확인해 주세요.';
  }

  const networkMessage = getNetworkErrorMessage(error);

  if (networkMessage) {
    return networkMessage;
  }

  return '중복 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.';
};

const getCreateUserErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return '이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.';
    }

    if (error.status === 422) {
      return '입력한 정보를 다시 확인해 주세요.';
    }
  }

  const networkMessage = getNetworkErrorMessage(error);

  if (networkMessage) {
    return networkMessage;
  }

  return '계정 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.';
};

const getLoginUserErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return '입력한 아이디를 찾을 수 없습니다. 처음이라면 새 아이디를 만들어 주세요.';
    }

    if (error.status === 422) {
      return '아이디 형식이 올바르지 않습니다. 입력값을 다시 확인해 주세요.';
    }
  }

  const networkMessage = getNetworkErrorMessage(error);

  if (networkMessage) {
    return networkMessage;
  }

  return '접속에 실패했습니다. 잠시 후 다시 시도해 주세요.';
};

const getProjectValidationMessage = ({
  projectName,
  projectDescription,
  projectType,
  projectDeadline,
}: {
  projectName: string;
  projectDescription: string;
  projectType: string;
  projectDeadline: string;
}) => {
  if (!projectName.trim()) {
    return '프로젝트 이름을 입력해 주세요.';
  }

  if (!projectDescription.trim()) {
    return '프로젝트 설명을 입력해 주세요.';
  }

  if (!projectType.trim()) {
    return '프로젝트 유형을 입력해 주세요.';
  }

  const deadlineDate = new Date(projectDeadline);

  if (!projectDeadline || Number.isNaN(deadlineDate.getTime())) {
    return '마감일을 올바르게 입력해 주세요.';
  }

  return '';
};

export const useLandingPage = () => {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<LandingViewMode>('landing');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [identityMode, setIdentityMode] = useState<UserIdentityMode>('access');
  const [currentUser, setCurrentUser] = useState<UserIdentity | null>(null);
  const [availableUserId, setAvailableUserId] = useState('');
  const [userIdInput, setUserIdInput] = useState('');
  const [userNameInput, setUserNameInput] = useState('');
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

  const resetIdentityPrompt = () => {
    setCurrentUser(null);
    setAvailableUserId('');
    setDuplicateCheckMessage('');
  };

  const resetUserAvailability = () => {
    setAvailableUserId('');
    setDuplicateCheckMessage('');
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
    resetUserAvailability();

    if (currentUser && currentUser.id !== value) {
      setCurrentUser(null);
    }
  };

  const handleUserNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserNameInput(event.target.value);
  };

  const handleCheckDuplicate = async () => {
    const normalizedUserId = userIdInput.trim();
    const warning = validateUserId(normalizedUserId);

    setUserIdWarning(warning);

    if (warning || !normalizedUserId) {
      resetIdentityPrompt();
      return;
    }

    setIsLoading(true);
    setDuplicateCheckMessage('아이디 사용 가능 여부를 확인하고 있습니다.');

    try {
      const { available } = await checkUserAvailability(normalizedUserId);

      if (!available) {
        resetIdentityPrompt();
        setDuplicateCheckMessage('이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.');
        return;
      }

      setCurrentUser(null);
      setAvailableUserId(normalizedUserId);
      setDuplicateCheckMessage('사용 가능한 아이디입니다. 계정 생성을 눌러 주세요.');
    } catch (error) {
      resetIdentityPrompt();
      setDuplicateCheckMessage(getAvailabilityErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    const normalizedUserId = userIdInput.trim();
    const normalizedUserName = userNameInput.trim();

    if (!availableUserId || availableUserId !== normalizedUserId) {
      setDuplicateCheckMessage('먼저 중복 확인을 완료해 주세요.');
      return;
    }

    if (!normalizedUserName) {
      setDuplicateCheckMessage('이름을 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setDuplicateCheckMessage('계정을 생성하고 있습니다.');

    try {
      const createdUser = await createUser({
        username: normalizedUserId,
        name: normalizedUserName,
        role: null,
      });
      const user = toUserIdentity(createdUser);

      setCurrentUser(user);
      setAvailableUserId('');
      setIdentityMode('access');
      setDuplicateCheckMessage('계정이 생성되어 바로 접속되었습니다.');
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        resetUserAvailability();
      }
      setDuplicateCheckMessage(getCreateUserErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessExistingUser = async () => {
    const normalizedUserId = userIdInput.trim();
    const warning = validateUserId(normalizedUserId);

    setUserIdWarning(warning);

    if (warning || !normalizedUserId) {
      resetUserAvailability();
      return;
    }

    setIsLoading(true);
    setDuplicateCheckMessage('접속하고 있습니다.');

    try {
      const user = toUserIdentity(await loginUser(normalizedUserId));

      setCurrentUser(user);
      setAvailableUserId('');
      setDuplicateCheckMessage('기존 아이디로 접속되었습니다.');
    } catch (error) {
      setCurrentUser(null);
      setAvailableUserId('');
      setDuplicateCheckMessage(getLoginUserErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToCreateUser = () => {
    setIdentityMode('create');
    resetIdentityPrompt();
    setUserIdWarning(validateUserId(userIdInput));
  };

  const handleSwitchToAccessUser = () => {
    setIdentityMode('access');
    resetIdentityPrompt();
    setUserIdWarning(validateUserId(userIdInput));
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

  const handleCreateProjectSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentUser) {
      setErrorMessage('먼저 사용자 아이디로 접속하거나 새 아이디를 만들어 주세요.');
      return;
    }

    const validationMessage = getProjectValidationMessage({
      projectName,
      projectDescription,
      projectType,
      projectDeadline,
    });

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const localProjectId = crypto.randomUUID();

    setCreatedProjectId(localProjectId);
    setIsCopied(false);
    setPendingNavigateData({
      userId: currentUser.id,
      userUuid: currentUser.uuid,
      projectId: localProjectId,
      projectCode: localProjectId,
      title: projectName.trim(),
      role: 'admin',
    });
    setIsSuccessModalOpen(true);
    setIsLoading(false);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(createdProjectId);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setErrorMessage('코드 복사에 실패했습니다. 다시 시도해 주세요.');
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
      isUserIdAvailable: availableUserId === userIdInput.trim(),
      userIdInput,
      userNameInput,
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
      handleUserNameInputChange,
      handleCheckDuplicate,
      handleCreateUser,
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
