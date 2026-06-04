import { ApiError } from '../../lib/api';
import type { UserResponse } from '../../lib/api';
import { setStoredUserIdentity } from '../../lib/authCookie';
import type { UserIdentity } from './types';

const USER_ID_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,}$/;
const INVALID_PROJECT_DEADLINE_MESSAGE = '마감일은 오늘 또는 이후 날짜로 설정해 주세요.';

export const validateUserId = (value: string) => {
  if (!value) {
    return '';
  }

  if (!USER_ID_PATTERN.test(value)) {
    return '아이디는 영문과 숫자를 조합해 3자 이상으로 입력해야 합니다.';
  }

  return '';
};

export const toUserIdentity = (user: UserResponse): UserIdentity => ({
  id: user.username,
  name: user.name,
  uuid: getUserUuid(user),
});

export const storeUserIdentity = (user: UserIdentity) => {
  setStoredUserIdentity(user);
};

export const getAvailabilityErrorMessage = (error: unknown) => {
  if (error instanceof ApiError && error.status === 422) {
    return '아이디 형식이 올바르지 않습니다. 입력값을 다시 확인해 주세요.';
  }

  const networkMessage = getNetworkErrorMessage(error);

  if (networkMessage) {
    return networkMessage;
  }

  return '중복 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.';
};

export const getCreateUserErrorMessage = (error: unknown) => {
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

export const getLoginUserErrorMessage = (error: unknown) => {
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

export const getCreateProjectErrorMessage = (error: unknown) => {
  if (error instanceof ApiError && error.status === 422) {
    return '프로젝트 정보를 다시 확인해 주세요.';
  }

  const networkMessage = getNetworkErrorMessage(error);

  if (networkMessage) {
    return networkMessage;
  }

  return '프로젝트 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.';
};

export const getJoinProjectErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return '해당 프로젝트 코드를 찾을 수 없습니다.';
    }

    if (error.status === 409) {
      return '이미 참여 중인 프로젝트입니다.';
    }

    if (error.status === 422) {
      return '프로젝트 코드와 사용자 정보를 다시 확인해 주세요.';
    }
  }

  const networkMessage = getNetworkErrorMessage(error);

  if (networkMessage) {
    return networkMessage;
  }

  return '프로젝트 참여에 실패했습니다. 잠시 후 다시 시도해 주세요.';
};

export const logCreateProjectError = (error: unknown, payload: unknown) => {
  console.error('[Landing][CreateProject:Failed]', {
    payload,
    error,
  });

  if (error instanceof ApiError) {
    console.error('[Landing][CreateProject:APIError]', {
      status: error.status,
      body: error.body,
    });

    if (isValidationDetailBody(error.body)) {
      console.table(error.body.detail);
    }
  }
};

export const getProjectValidationMessage = ({
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

  return getProjectDeadlineValidationMessage(projectDeadline);
};

export const getProjectDeadlineValidationMessage = (projectDeadline: string) => {
  if (!projectDeadline) {
    return '마감일을 올바르게 입력해 주세요.';
  }

  const deadlineDate = parseLocalDate(projectDeadline);

  if (Number.isNaN(deadlineDate.getTime())) {
    return '마감일을 올바르게 입력해 주세요.';
  }

  if (isDateBeforeToday(deadlineDate)) {
    return INVALID_PROJECT_DEADLINE_MESSAGE;
  }

  return '';
};

export const toDeadlineISOString = (dateValue: string) => {
  const deadline = parseLocalDate(dateValue);

  deadline.setHours(23, 59, 59, 999);

  return deadline.toISOString();
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

const getUserUuid = (user: UserResponse) => {
  const flexibleUser = user as UserResponse & {
    user_id?: string;
    user_uuid?: string;
    uuid?: string;
  };

  return flexibleUser.id ?? flexibleUser.user_id ?? flexibleUser.user_uuid ?? flexibleUser.uuid ?? '';
};

const isValidationDetailBody = (body: unknown): body is { detail: unknown[] } => {
  return (
    typeof body === 'object' &&
    body !== null &&
    'detail' in body &&
    Array.isArray((body as { detail?: unknown }).detail)
  );
};

const parseLocalDate = (dateValue: string) => {
  const [year, month, date] = dateValue.split('-').map(Number);

  return new Date(year, month - 1, date);
};

const isDateBeforeToday = (date: Date) => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return date.getTime() < startOfToday.getTime();
};
