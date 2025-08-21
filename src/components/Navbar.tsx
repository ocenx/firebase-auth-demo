// src/components/Navbar.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setNotifCount(snap.size); // total notifications count
    });

    return () => unsub();
  }, [user]);

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-blue-600 text-white">
      <h1 className="text-xl font-bold">My App</h1>

      <div className="flex items-center space-x-4">
        {!user ? (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/signup" className="hover:underline">Signup</Link>
          </>
        ) : (
          <>
            {/* 🔔 Notifications button */}
            <Link to="/notifications" className="relative">
              <span className="text-2xl">🔔</span>
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            <Link to="/profile" className="flex items-center space-x-2">
              <img
                src={user.photoURL || "https://via.placeholder.com/40"}
                alt="avatar"
                className="w-8 h-8 rounded-full border"
              />
              <span className="hidden sm:inline">{user.displayName || "User"}</span>
            </Link>

            {/* Logout */}
            <button
              onClick={logout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
