import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import { clearAdminSession, getAdminToken, getStoredAdmin, isJwtExpired, saveAdminSession } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(getStoredAdmin());
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearAdminSession();
    setAdmin(null);
  }, []);

  const validate = useCallback(async () => {
    const token = getAdminToken();
    if (!token || isJwtExpired(token)) {
      logout();
      setLoading(false);
      return;
    }
    try {
      const { data } = await API.get("/auth/profile");
      const user = data.user || data.data;
      if (!user || user.role !== "ADMIN") throw new Error("Admin access only");
      saveAdminSession(token, user);
      setAdmin(user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => { validate(); }, [validate]);

  const login = useCallback(async (credentials) => {
    const { data } = await API.post("/auth/login", credentials);
    const token = data.token || data.data?.token;
    const user = data.user || data.data?.user;
    if (!token || !user) throw new Error("The server returned an incomplete login response.");
    if (user.role !== "ADMIN") throw new Error("This account does not have admin access.");
    saveAdminSession(token, user);
    setAdmin(user);
    return user;
  }, []);

  const value = useMemo(() => ({ admin, loading, isAuthenticated: Boolean(admin), login, logout, refresh: validate }), [admin, loading, login, logout, validate]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
};
