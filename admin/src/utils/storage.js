const TOKEN_KEY = "adminToken";
const USER_KEY = "adminUser";

const storageAvailable = () => {
  try {
    const key = "__legend_admin_storage_test__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

export const readJson = (key, fallback = null) => {
  if (!storageAvailable()) return fallback;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const getAdminToken = () => {
  if (!storageAvailable()) return "";
  try { return localStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; }
};

export const getStoredAdmin = () => readJson(USER_KEY, null);

export const saveAdminSession = (token, user) => {
  if (!storageAvailable()) throw new Error("Browser storage is unavailable. Enable site storage to sign in to the admin dashboard.");
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAdminSession = () => {
  if (!storageAvailable()) return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // A failed cleanup should not block logout navigation.
  }
};

export const isJwtExpired = (token) => {
  if (!token) return true;
  try {
    const part = token.split(".")[1];
    if (!part) return true;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
    const payload = JSON.parse(atob(base64));
    return !payload.exp || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};
