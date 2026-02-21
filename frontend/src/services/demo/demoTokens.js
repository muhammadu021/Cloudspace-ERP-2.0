import { appConfig } from '@/config/appConfig';

const DEMO_SECRET = 'cleardesk-demo-secret';
const ONE_DAY = 60 * 60 * 24;
const ONE_WEEK = ONE_DAY * 7;

const encode = (obj) =>
  btoa(JSON.stringify(obj))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const decode = (segment) => {
  try {
    const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized));
  } catch (error) {
    return null;
  }
};

const sign = (payload) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = encode(header);
  const encodedPayload = encode(payload);
  const signature = encode({ s: DEMO_SECRET });
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const generateDemoTokens = (user) => {
  const now = Math.floor(Date.now() / 1000);

  const accessToken = sign({
    email: user.email,
    userId: user.id,
    company_id: user.company_id,
    exp: now + ONE_DAY,
    iss: 'cleardesk-demo',
    demo: true,
  });

  const refreshToken = sign({
    email: user.email,
    userId: user.id,
    exp: now + ONE_WEEK,
    type: 'refresh',
    demo: true,
  });

  return { accessToken, refreshToken };
};

export const verifyDemoToken = (token) => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const payload = decode(parts[1]);
  if (!payload) return null;

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    return null;
  }

  return payload;
};

export default {
  generateDemoTokens,
  verifyDemoToken,
};
