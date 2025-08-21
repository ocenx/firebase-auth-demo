import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";
import type { JSX } from "react";

type Props = {
  children: JSX.Element;
};

export default function AuthRoute({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  // 🚀 If logged in, redirect based on role
  if (user) {
    return <Navigate to={user.isAdmin ? "/admin" : "/welcome"} replace />;
  }

  return children;
}
