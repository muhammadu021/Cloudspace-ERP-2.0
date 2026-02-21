import api from '@/services/api';
import { appConfig } from '@/config/appConfig';

let fetchInstalled = false;

const API_PREFIX = '/api/v1';
const INTERCEPT_PATHS = [
  '/auth',
  '/dashboard',
  '/self-service',
  '/projects',
  '/purchase-requests',
  '/finance',
  '/hr',
  '/inventory',
  '/sales',
  '/settings',
  '/folders',
  '/collaboration',
  '/company',
  '/admin'
];

const toPlainHeaders = (headersLike = {}) => {
  const headers = new Headers(headersLike);
  const result = {};
  headers.forEach((value, key) => {
    result[key.toLowerCase()] = value;
  });
  return result;
};

const buildResponse = (axiosResponse) => {
  const headers = new Headers();
  const sourceHeaders = axiosResponse.headers || {};
  Object.entries(sourceHeaders).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => headers.append(key, entry));
    } else if (value !== undefined) {
      headers.append(key, value);
    }
  });

  const data = axiosResponse.data;
  let body;

  if (data instanceof Blob) {
    body = data;
  } else if (data instanceof ArrayBuffer) {
    body = new Blob([data]);
  } else if (typeof data === 'string') {
    if (!headers.has('content-type')) {
      headers.set('content-type', 'text/plain;charset=utf-8');
    }
    body = new Blob([data], { type: headers.get('content-type') });
  } else if (data === undefined || data === null) {
    body = new Blob([''], { type: headers.get('content-type') || 'text/plain' });
  } else {
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }
    body = new Blob([JSON.stringify(data)], { type: headers.get('content-type') });
  }

  const response = new Response(body, {
    status: axiosResponse.status,
    statusText: axiosResponse.statusText,
    headers
  });

  Object.defineProperty(response, 'url', {
    value: axiosResponse.config?.url || '',
  });

  return response;
};

const normalizeBody = (body, headers) => {
  if (!body) return undefined;
  if (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer) {
    return body;
  }
  if (body instanceof URLSearchParams) {
    if (!headers['content-type']) {
      headers['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    }
    return body.toString();
  }
  if (typeof body === 'string') {
    const isJson = (headers['content-type'] || '').includes('application/json');
    if (isJson) {
      try {
        return JSON.parse(body);
      } catch (error) {
        return body;
      }
    }
    return body;
  }
  return body;
};

const shouldIntercept = (url) => {
  if (!appConfig.demoMode) return false;
  try {
    const apiHost = new URL(appConfig.apiUrl);
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin === apiHost.origin) {
      return true;
    }
    if (parsed.origin !== window.location.origin) {
      return false;
    }
    if (parsed.pathname.startsWith(API_PREFIX)) {
      return true;
    }
    return INTERCEPT_PATHS.some((prefix) => parsed.pathname.startsWith(prefix));
  } catch (error) {
    return false;
  }
};

const mapUrlToApiPath = (url) => {
  const parsed = new URL(url, window.location.origin);
  let path = parsed.pathname;
  if (path.startsWith(API_PREFIX)) {
    path = path.slice(API_PREFIX.length) || '/';
  }
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  return `${path}${parsed.search}`;
};

export const installDemoFetch = () => {
  if (fetchInstalled || typeof window === 'undefined' || !appConfig.demoMode) {
    return;
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const requestUrl = typeof input === 'string' ? input : input.url;
    if (!shouldIntercept(requestUrl)) {
      return originalFetch(input, init);
    }

    const method = (init.method || (typeof input === 'object' && input.method) || 'GET').toUpperCase();
    const headers = toPlainHeaders(init.headers || (typeof input === 'object' ? input.headers : undefined));
    const body = init.body;
    const axiosConfig = {
      url: mapUrlToApiPath(requestUrl),
      method,
      headers
    };

    if (body !== undefined && method !== 'GET' && method !== 'HEAD') {
      axiosConfig.data = normalizeBody(body, headers);
    }

    try {
      const axiosResponse = await api.request(axiosConfig);
      return buildResponse(axiosResponse);
    } catch (error) {
      if (error.response) {
        return buildResponse(error.response);
      }
      throw error;
    }
  };

  fetchInstalled = true;
};

export default installDemoFetch;
