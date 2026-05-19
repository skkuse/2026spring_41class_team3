import type * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, createProject } from '../../lib/api';
import type { LandingViewMode, MockProjectData } from './types';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const toApiErrorMessage = (error: unknown) => {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }

  return '프로젝트 생성 중 오류가 발생했습니다.';
};

export const useLandingPage = () => {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<LandingViewMode>('landing');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [userId, setUserId] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [ownerUserId, setOwnerUserId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectType, setProjectType] = useState('');
  const [projectDeadline, setProjectDeadline] = useState('');

  const [idWarning, setIdWarning] = useState('');
  const [ownerUserIdWarning, setOwnerUserIdWarning] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [successCode, setSuccessCode] = useState('');
  const [pendingNavigateData, setPendingNavigateData] = useState<MockProjectData | null>(null);

  const resetCreateProjectForm = () => {
    setErrorMessage('');
    setOwnerUserIdWarning('');
    setOwnerUserId('');
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
    resetCreateProjectForm();
    setViewMode('create_project');
  };

  const handleUserIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setUserId(value);
    setIdWarning(value.length > 0 && value.length < 3 ? '최소 3글자 이상 입력해 주세요.' : '');
  };

  const handleOwnerUserIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setOwnerUserId(value);
    setOwnerUserIdWarning(
      value.length > 0 && !UUID_PATTERN.test(value) ? 'owner_user_id는 UUID 형식이어야 합니다.' : '',
    );
  };

  const handleProjectCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProjectCode(event.target.value.replace(/[^0-9]/g, ''));
  };

  const handleOpenJoinModal = () => {
    setErrorMessage('');
    setProjectCode('');
    setUserId('');
    setIdWarning('');
    setIsJoinModalOpen(true);
  };

  const handleCloseJoinModal = () => {
    setIsJoinModalOpen(false);
  };

  const handleJoinSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (idWarning) return;

    if (!userId || userId.length < 3) {
      setErrorMessage('사용자 ID는 최소 3글자 이상이어야 합니다.');
      return;
    }

    if (projectCode.length !== 10) {
      setErrorMessage('코드는 정확히 10자리 숫자여야 합니다.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsLoading(false);
      setIsJoinModalOpen(false);
      navigate('/dashboard', {
        state: {
          userId,
          projectCode,
          title: '참여한 협업 프로젝트',
        },
      });
    }, 800);
  };

  const handleCreateProjectSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (ownerUserIdWarning) return;

    if (!UUID_PATTERN.test(ownerUserId)) {
      setErrorMessage('owner_user_id는 UUID 형식이어야 합니다.');
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
        owner_user_id: ownerUserId.trim(),
        description: projectDescription.trim(),
        project_type: projectType.trim(),
        deadline: deadlineDate.toISOString(),
      });

      setSuccessCode(createdProject.id);
      setIsCopied(false);
      setPendingNavigateData({
        userId: createdProject.owner_id,
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
      await navigator.clipboard.writeText(successCode);
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
      userId,
      projectCode,
      ownerUserId,
      projectName,
      projectDescription,
      projectType,
      projectDeadline,
      idWarning,
      ownerUserIdWarning,
      errorMessage,
      successCode,
    },
    actions: {
      goToLanding,
      handleCreateProjectClick,
      handleOpenJoinModal,
      handleCloseJoinModal,
      handleUserIdChange,
      handleProjectCodeChange,
      handleJoinSubmit,
      handleOwnerUserIdChange,
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
