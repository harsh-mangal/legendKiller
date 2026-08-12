import { Navigate, useLocation } from "react-router-dom";
import { LoadingState } from "./ui";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen bg-[#f4f2eb]"><LoadingState label="Checking administrator session…" className="min-h-screen" /></div>;
  if (!isAuthenticated) return <Navigate to={`/login?next=${encodeURIComponent(`${location.pathname}${location.search}`)}`} replace />;
  return children;
}
