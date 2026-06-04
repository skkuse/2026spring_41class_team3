const USER_UUID_COOKIE_NAME = 'mars_user_uuid';
const USER_IDENTITY_COOKIE_NAME = 'mars_user_identity';
const USER_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export interface StoredUserIdentity {
  id: string;
  name: string;
  uuid: string;
}

export const setStoredUserUuid = (userUuid: string) => {
  setCookie(USER_UUID_COOKIE_NAME, userUuid);
};

export const getStoredUserUuid = () => {
  return getCookie(USER_UUID_COOKIE_NAME);
};

export const setStoredUserIdentity = (user: StoredUserIdentity) => {
  setStoredUserUuid(user.uuid);
  setCookie(USER_IDENTITY_COOKIE_NAME, JSON.stringify(user));
};

export const getStoredUserIdentity = (): StoredUserIdentity | null => {
  const rawUser = getCookie(USER_IDENTITY_COOKIE_NAME);

  if (!rawUser) {
    return null;
  }

  try {
    const user = JSON.parse(rawUser) as Partial<StoredUserIdentity>;

    if (typeof user.id === 'string' && typeof user.name === 'string' && typeof user.uuid === 'string') {
      return {
        id: user.id,
        name: user.name,
        uuid: user.uuid,
      };
    }
  } catch {
    return null;
  }

  return null;
};

const setCookie = (name: string, value: string) => {
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    'path=/',
    `max-age=${USER_COOKIE_MAX_AGE_SECONDS}`,
    'samesite=lax',
  ].join('; ');
};

const getCookie = (name: string) => {
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) {
    return '';
  }

  return decodeURIComponent(cookie.split('=').slice(1).join('='));
};
