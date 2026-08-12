export const AUTH_TOKEN_KEY = "legend_token";
export const AUTH_USER_KEY = "legend_user";

const localFallback = new Map();
const sessionFallback = new Map();

const browserStorage = (type) => {
  try {
    if (typeof window === "undefined") return null;
    return type === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
};

const fallbackFor = (type) => (type === "session" ? sessionFallback : localFallback);

const getItem = (type, key) => {
  const fallback = fallbackFor(type);
  try {
    const value = browserStorage(type)?.getItem(key);
    if (value !== null && value !== undefined) {
      fallback.set(key, value);
      return value;
    }
  } catch {
    // Use the in-memory fallback when browser storage is unavailable.
  }
  return fallback.get(key) ?? null;
};

const setItem = (type, key, value) => {
  const serialized = String(value);
  fallbackFor(type).set(key, serialized);
  try {
    browserStorage(type)?.setItem(key, serialized);
  } catch {
    // The current tab can continue using the in-memory fallback.
  }
};

const removeItem = (type, key) => {
  fallbackFor(type).delete(key);
  try {
    browserStorage(type)?.removeItem(key);
  } catch {
    // The fallback has already been cleared.
  }
};

export const safeJsonParse = (value, fallback = null) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const getLocalItem = (key) => getItem("local", key);
export const setLocalItem = (key, value) => setItem("local", key, value);
export const removeLocalItem = (key) => removeItem("local", key);
export const getSessionItem = (key) => getItem("session", key);
export const setSessionItem = (key, value) => setItem("session", key, value);
export const removeSessionItem = (key) => removeItem("session", key);
export const getStoredToken = () => getLocalItem(AUTH_TOKEN_KEY);

export const clearStoredSession = () => {
  removeLocalItem(AUTH_TOKEN_KEY);
  removeLocalItem(AUTH_USER_KEY);
};
