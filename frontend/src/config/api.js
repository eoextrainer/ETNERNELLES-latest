const normalizeBaseUrl = (url) => {
  if (!url) return '';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const normalizeApiBase = (url) => {
  if (!url) return '';
  if (url.endsWith('/api/v1')) {
    return url.slice(0, -3);
  }
  if (url.endsWith('/v1')) {
    return url.slice(0, -3);
  }
  if (url.endsWith('/api')) {
    return url;
  }
  return `${url}/api`;
};

const DEFAULT_RENDER_BACKEND = 'https://eternelles-backend-xeak.onrender.com';
const FALLBACK_RENDER_BACKENDS = [DEFAULT_RENDER_BACKEND];
const BLOCKED_API_HOSTS = new Set([
  'https://eternelles-api-jf14.onrender.com',
  'http://eternelles-api-jf14.onrender.com',
]);

const getStoredApiBase = () => {
  if (typeof window === 'undefined') return '';
  try {
    const stored = normalizeApiBase(normalizeBaseUrl(localStorage.getItem('api_base')));
    if (stored && !BLOCKED_API_HOSTS.has(stored)) {
      return stored;
    }
    return '';
  } catch (err) {
    return '';
  }
};

const isLocalhost = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
};

const getLockedApiBase = () => {
  const envBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (!envBase) return '';
  const normalized = normalizeApiBase(normalizeBaseUrl(envBase));
  if (normalized && !BLOCKED_API_HOSTS.has(normalized)) {
    return normalized;
  }
  return '';
};

export const isApiBaseLocked = () => {
  const lockFlag = import.meta.env.VITE_API_BASE_LOCKED;
  if (lockFlag && String(lockFlag).toLowerCase() === 'true') {
    return true;
  }
  const envBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  return Boolean(envBase) && !isLocalhost();
};

export const getApiBaseUrl = () => {
  if (isLocalhost()) {
    const envBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
    if (envBase && (envBase.includes('localhost') || envBase.includes('127.0.0.1'))) {
      const normalized = normalizeApiBase(normalizeBaseUrl(envBase));
      if (!BLOCKED_API_HOSTS.has(normalized)) {
        return normalized;
      }
    }
    return '/api';
  }

  if (isApiBaseLocked()) {
    const lockedBase = getLockedApiBase();
    if (lockedBase) {
      return lockedBase;
    }
  }

  const storedBase = getStoredApiBase();
  if (storedBase) {
    return storedBase;
  }

  const envBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envBase) {
    const normalized = normalizeApiBase(normalizeBaseUrl(envBase));
    if (!BLOCKED_API_HOSTS.has(normalized)) {
      return normalized;
    }
  }

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin.includes('eternelles-frontend')) {
      return normalizeApiBase(normalizeBaseUrl(DEFAULT_RENDER_BACKEND));
    }
    if (origin.includes('onrender.com')) {
      return normalizeApiBase(normalizeBaseUrl(DEFAULT_RENDER_BACKEND));
    }
  }

  return '/api';
};

export const getApiBaseCandidates = () => {
  const base = getApiBaseUrl();

  if (isApiBaseLocked()) {
    return base ? [base] : [];
  }

  const candidates = new Set();
  const storedBase = getStoredApiBase();

  [storedBase, base, ...FALLBACK_RENDER_BACKENDS].forEach((item) => {
    if (item && !BLOCKED_API_HOSTS.has(item)) {
      candidates.add(item);
    }
  });

  if (base.endsWith('/api')) {
    const trimmed = base.slice(0, -4);
    if (!BLOCKED_API_HOSTS.has(trimmed)) {
      candidates.add(trimmed);
    }
  } else if (!base.endsWith('/api')) {
    const withApi = `${base}/api`;
    if (!BLOCKED_API_HOSTS.has(withApi)) {
      candidates.add(withApi);
    }
  }

  return Array.from(candidates).filter(Boolean);
};
