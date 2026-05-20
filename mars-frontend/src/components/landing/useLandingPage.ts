import type * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LandingViewMode, ProjectNavigationState, UserIdentity, UserIdentityMode } from './types';

const USER_ID_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,}$/;
const CREATE_USER_API = 'POST /users/';
const READ_USER_API = 'GET /users/{user_id}';
const CREATE_PROJECT_API = 'POST /projects/';
const PROJECT_JOIN_API = 'POST /projects/{project_id}/members';

const logButtonClick = (buttonName: string, api?: string) => {
  console.log('[Landing][Button]', {
    button: buttonName,
    api: api ?? '-',
  });
};

const logApiSkipped = (buttonName: string, api: string, detail?: unknown) => {
  console.log('[Landing][API]', {
    button: buttonName,
    api,
    result: 'skipped',
    detail: detail ?? 'API 연결 전: 로그만 확인',
  });
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
  const [userRegistry, setUserRegistry] = useState<Record<string, string>>({});
  const [availableUserId, setAvailableUserId] = useState('');
  const [userIdInput, setUserIdInput] = useState('');
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
    logButtonClick('새 프로젝트 생성');

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

  const handleCheckDuplicate = () => {
    logButtonClick('중복 확인', READ_USER_API);

    const normalizedUserId = userIdInput.trim();
    const warning = validateUserId(normalizedUserId);

    setUserIdWarning(warning);

    if (warning || !normalizedUserId) {
      resetIdentityPrompt();
      return;
    }

    const registeredUuid = userRegistry[normalizedUserId];

    if (registeredUuid) {
      logApiSkipped('중복 확인', READ_USER_API, '조회 결과: 이미 존재하는 아이디');
      resetIdentityPrompt();
      setDuplicateCheckMessage('이미 사용 중인 아이디입니다. 접속하기를 이용해 주세요.');
      return;
    }

    setCurrentUser(null);
    setAvailableUserId(normalizedUserId);
    logApiSkipped('중복 확인', READ_USER_API, '조회 결과: 사용 가능한 아이디');
    setDuplicateCheckMessage('사용 가능한 아이디입니다. 계정 생성을 눌러 주세요.');
  };

  const handleCreateUser = () => {
    logButtonClick('계정 생성', CREATE_USER_API);

    const normalizedUserId = userIdInput.trim();

    if (!availableUserId || availableUserId !== normalizedUserId) {
      setDuplicateCheckMessage('먼저 중복 확인을 완료해 주세요.');
      return;
    }

    const user = {
      id: normalizedUserId,
      uuid: crypto.randomUUID(),
    };

    setUserRegistry((registry) => ({
      ...registry,
      [user.id]: user.uuid,
    }));
    logApiSkipped('계정 생성', CREATE_USER_API, {
      userId: user.id,
      userUuid: user.uuid,
    });
    setCurrentUser(user);
    setAvailableUserId('');
    setIdentityMode('access');
    setDuplicateCheckMessage('계정이 생성되어 바로 접속되었습니다.');
  };

  const handleAccessExistingUser = () => {
    logButtonClick('접속', READ_USER_API);

    const normalizedUserId = userIdInput.trim();
    const warning = validateUserId(normalizedUserId);

    setUserIdWarning(warning);

    if (warning || !normalizedUserId) {
      resetUserAvailability();
      return;
    }

    const registeredUuid = userRegistry[normalizedUserId];

    if (!registeredUuid) {
      logApiSkipped('접속', READ_USER_API, '현재 세션에 등록된 아이디 없음');
      setCurrentUser(null);
      setAvailableUserId('');
      setDuplicateCheckMessage('등록된 아이디가 없습니다.');
      return;
    }

    const user = {
      id: normalizedUserId,
      uuid: registeredUuid,
    };

    setCurrentUser(user);
    setAvailableUserId('');
    setDuplicateCheckMessage('기존 아이디로 접속되었습니다.');
  };

  const handleSwitchToCreateUser = () => {
    logButtonClick('처음이신가요? 새 아이디 만들기');

    setIdentityMode('create');
    resetIdentityPrompt();
    setUserIdWarning(validateUserId(userIdInput));
  };

  const handleSwitchToAccessUser = () => {
    logButtonClick('접속하기');

    setIdentityMode('access');
    resetIdentityPrompt();
    setUserIdWarning(validateUserId(userIdInput));
  };

  const handleProjectCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectCode(event.target.value.replace(/[^0-9]/g, ''));
  };

  const handleOpenJoinModal = () => {
    logButtonClick('프로젝트 코드로 참여');

    if (!currentUser) {
      setDuplicateCheckMessage('먼저 사용자 아이디로 접속하거나 새 아이디를 만들어 주세요.');
      return;
    }

    setErrorMessage('');
    setProjectCode('');
    setIsJoinModalOpen(true);
  };

  const handleCloseJoinModal = () => {
    logButtonClick('프로젝트 참여 모달 닫기');
    setIsJoinModalOpen(false);
  };

  const handleJoinSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    logButtonClick('프로젝트 입장', PROJECT_JOIN_API);

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
    logApiSkipped('프로젝트 입장', PROJECT_JOIN_API, {
      project_id: projectCode,
      user_id: currentUser.uuid,
    });
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
    logButtonClick('프로젝트 생성 및 입장', CREATE_PROJECT_API);

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
    const deadlineDate = new Date(projectDeadline);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const localProjectId = crypto.randomUUID();

    logApiSkipped('프로젝트 생성 및 입장', CREATE_PROJECT_API, {
      name: projectName.trim(),
      owner_user_id: currentUser.uuid,
      description: projectDescription.trim(),
      project_type: projectType.trim(),
      deadline: deadlineDate.toISOString(),
    });

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
    logButtonClick('프로젝트 ID 복사');

    try {
      await navigator.clipboard.writeText(createdProjectId);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('코드 복사에 실패했습니다.', error);
    }
  };

  const handleCloseSuccessAndNavigate = () => {
    logButtonClick('대시보드로 입장하기');

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
