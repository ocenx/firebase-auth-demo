import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";
import type { JSX } from "react";

type Props = {
  children: JSX.Element;
};

export default function AdminRoute({ children }: Props) {
  const { user, loading } = useAuth();

  // 🔄 Wait for Firebase to check session
  if (loading) return <Loader />;

  // 🚪 Not logged in → force login
  if (!user) return <Navigate to="/login" replace />;

  // 🔒 Only admins can pass
  if (!user.isAdmin) return <Navigate to="/profile" replace />;

  return children;
}
