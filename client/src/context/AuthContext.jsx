import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi, unwrapData } from "../services/api";
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  clearStoredSession,
  getLocalItem,
  safeJsonParse,
  setLocalItem,
} from "../utils/storage";

const AuthContext = createContext(null);

const responseCandidates = (response) =>
  [response, response?.data, response?.data?.data, unwrapData(response)].filter(
    (candidate) => candidate && typeof candidate === "object"
  );

const extractSession = (response) => {
  const candidates = responseCandidates(response);
  const token = candidates
    .map((candidate) => candidate.token || candidate.accessToken || candidate.access_token || candidate.jwt)
    .find(Boolean);
  const user = candidates
    .map((candidate) => candidate.user || candidate.profile || candidate.customer)
    .find(Boolean);
  return { token: token || "", user: user || null };
};

const extractProfile = (response) => {
  const candidates = responseCandidates(response);
  return (
    candidates.map((candidate) => candidate.user || candidate.profile || candidate.customer).find(Boolean) ||
    unwrapData(response)
  );
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => safeJsonParse(getLocalItem(AUTH_USER_KEY)));
  const [token, setToken] = useState(() => getLocalItem(AUTH_TOKEN_KEY));
  const [authLoading, setAuthLoading] = useState(Boolean(token));

  const logout = useCallback(() => {
    clearStoredSession();
    setUser(null);
    setToken(null);
    setAuthLoading(false);
  }, []);

  const storeUser = useCallback((profile) => {
    if (!profile || typeof profile !== "object") throw new Error("Unable to load your profile.");
    setLocalItem(AUTH_USER_KEY, JSON.stringify(profile));
    setUser(profile);
    return profile;
  }, []);

  const refreshUser = useCallback(async () => {
    const response = await authApi.getProfile();
    return storeUser(extractProfile(response));
  }, [storeUser]);

  const saveSession = useCallback(
    async (response) => {
      const session = extractSession(response);
      if (!session.token) {
        return { authenticated: false, user: session.user, response };
      }

      setLocalItem(AUTH_TOKEN_KEY, session.token);
      setToken(session.token);

      try {
        const profile = session.user ? storeUser(session.user) : await refreshUser();
        return { authenticated: true, token: session.token, user: profile, response };
      } catch (error) {
        logout();
        throw error;
      }
    },
    [logout, refreshUser, storeUser]
  );

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener("ameyka:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("ameyka:unauthorized", handleUnauthorized);
  }, [logout]);

  useEffect(() => {
    let active = true;
    if (!token) {
      setAuthLoading(false);
      return undefined;
    }

    setAuthLoading(true);
    refreshUser()
      .catch(() => {
        if (active) logout();
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, refreshUser, logout]);

  const login = useCallback(async (form) => {
    const result = await saveSession(await authApi.login(form));
    if (!result.authenticated) throw new Error("The server did not return a valid login session.");
    return result;
  }, [saveSession]);

  const register = useCallback(async (form) => saveSession(await authApi.register(form)), [saveSession]);
  const requestOtp = useCallback((form) => authApi.requestOtp(form), []);
  const loginWithOtp = useCallback(async (form) => {
    const result = await saveSession(await authApi.loginWithOtp(form));
    if (!result.authenticated) throw new Error("The server did not return a valid login session.");
    return result;
  }, [saveSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      authLoading,
      isLoggedIn: Boolean(token && user),
      login,
      register,
      requestOtp,
      loginWithOtp,
      refreshUser,
      logout,
    }),
    [user, token, authLoading, login, register, requestOtp, loginWithOtp, refreshUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
