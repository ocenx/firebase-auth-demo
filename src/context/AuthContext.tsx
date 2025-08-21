import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  type User,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

// ✅ Extend Firebase User with isAdmin flag
export type ExtendedUser = User & { isAdmin?: boolean };

type AuthContextType = {
  user: ExtendedUser | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ✅ Replace with your admin emails
const ADMIN_EMAILS = ["admin@gmail.com"];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Adds isAdmin flag based on email
  const attachAdminFlag = (firebaseUser: User | null): ExtendedUser | null => {
    if (!firebaseUser) return null;
    const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email || "");
    return { ...firebaseUser, isAdmin };
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser(attachAdminFlag(auth.currentUser));
    }
  };

  const signup = async (email: string, password: string) => {
    await setPersistence(auth, browserLocalPersistence);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    setUser(attachAdminFlag(cred.user));
    // ❌ no navigate here, let ProtectedRoute handle redirect
  };

  const login = async (email: string, password: string) => {
    await setPersistence(auth, browserLocalPersistence);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    setUser(attachAdminFlag(cred.user));
    // ❌ no navigate here
  };

  const googleLogin = async () => {
    await setPersistence(auth, browserLocalPersistence);
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    setUser(attachAdminFlag(cred.user));
    // ❌ no navigate here
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    navigate("/login"); // ✅ only keep navigate here
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // ✅ Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(attachAdminFlag(firebaseUser));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        googleLogin,
        logout,
        resetPassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
