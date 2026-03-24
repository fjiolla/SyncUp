const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const isProd = process.env.NODE_ENV === 'production';

const rawFrontend = process.env.FRONTEND_URL;
const rawBackend = process.env.BACKEND_URL;

if (isProd) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    throw new Error('JWT_SECRET must be set and at least 16 characters in production.');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be set in production.');
  }
}

const frontendUrl = trimTrailingSlash(
  rawFrontend || (isProd ? 'https://your-frontend.com' : 'http://localhost:5173')
);

const backendUrl = trimTrailingSlash(rawBackend || 'http://localhost:5000');

export const env = {
  frontendUrl,
  backendUrl,
  corsOrigin: process.env.CORS_ORIGIN || frontendUrl,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || `${backendUrl}/api/auth/google/callback`,
  githubCallbackUrl: process.env.GITHUB_CALLBACK_URL || `${backendUrl}/api/auth/github/callback`,
};

