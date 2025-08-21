import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";
import type { JSX } from "react";

type Props = {
  children: JSX.Element;
  requireAdmin?: boolean; // ✅ optional: use this for admin-only routes
};

export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 🔄 Wait for Firebase session check
  if (loading) return <Loader />;

  // 🚪 Not logged in → always go to /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🔒 Admin-only route guard
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/welcome" replace />;
  }

  // 🚫 Non-admin trying to enter /admin → block
  if (!requireAdmin && user.isAdmin && location.pathname.startsWith("/welcome")) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
