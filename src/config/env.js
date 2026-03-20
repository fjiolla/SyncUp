const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const isProd = import.meta.env.PROD;
const rawApi = import.meta.env.VITE_API_BASE_URL;
const rawSocket = import.meta.env.VITE_SOCKET_URL;

if (isProd) {
  const apiInvalid = !rawApi || rawApi.includes('localhost') || rawApi.includes('127.0.0.1');
  const socketInvalid = rawSocket && (rawSocket.includes('localhost') || rawSocket.includes('127.0.0.1'));
  if (apiInvalid || socketInvalid) {
    const msg = [apiInvalid && 'VITE_API_BASE_URL', socketInvalid && 'VITE_SOCKET_URL'].filter(Boolean).join(', ') + ' must be set to production URLs.';
    console.error(msg);
    throw new Error(msg);
  }
}

const apiBaseUrl = trimTrailingSlash(rawApi || 'http://localhost:5000');
const socketUrl = trimTrailingSlash(rawSocket || apiBaseUrl);

export const env = {
  apiBaseUrl,
  socketUrl,
  oauthGoogleUrl: `${apiBaseUrl}/api/auth/google`,
  oauthGithubUrl: `${apiBaseUrl}/api/auth/github`,
};

