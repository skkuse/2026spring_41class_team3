const USER_UUID_COOKIE_NAME = 'mars_user_uuid';
const USER_UUID_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const setStoredUserUuid = (userUuid: string) => {
  document.cookie = [
    `${USER_UUID_COOKIE_NAME}=${encodeURIComponent(userUuid)}`,
    'path=/',
    `max-age=${USER_UUID_COOKIE_MAX_AGE_SECONDS}`,
    'samesite=lax',
  ].join('; ');
};

export const getStoredUserUuid = () => {
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${USER_UUID_COOKIE_NAME}=`));

  if (!cookie) {
    return '';
  }

  return decodeURIComponent(cookie.split('=').slice(1).join('='));
};
