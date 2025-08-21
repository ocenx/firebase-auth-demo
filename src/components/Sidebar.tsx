import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import {
  MessageSquare,
  CheckSquare,
  Folder,
  Calendar,
  ShoppingBag,
  Heart,
  FileText,
  Bell,
  User,
  LogOut,
  Star,
  Menu,
  X
} from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifCount, setNotifCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false); // 📱 mobile sidebar toggle

  // 🔔 Listen to unread notifications
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      let count = 0;
      snap.forEach((doc) => {
        const data = doc.data();
        if (!data.readBy || !data.readBy.includes(user.uid)) {
          count++;
        }
      });
      setNotifCount(count);
    });
    return () => unsub();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const links = [
    { to: "/profile", label: "Edit Profile", icon: <User size={18} /> },
    { to: "/chat", label: "Chat", icon: <MessageSquare size={18} /> },
    { to: "/todo", label: "To-Do", icon: <CheckSquare size={18} /> },
    { to: "/files", label: "Files", icon: <Folder size={18} /> },
    { to: "/events", label: "Events", icon: <Calendar size={18} /> },
    { to: "/products", label: "Products", icon: <ShoppingBag size={18} /> },
    { to: "/favorites", label: "Favorites", icon: <Heart size={18} /> },
    { to: "/blog", label: "Blog", icon: <FileText size={18} /> },
    { to: "/myposts", label: "My Posts", icon: <FileText size={18} /> },
    { to: "/notifications", label: "Notifications", icon: <Bell size={18} />, notif: true },
    { to: "/feedback", label: "Feedback", icon: <Star size={18} /> },
  ];

  return (
    <>
      {/* 📱 Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#1a1110] text-white shadow-md">
        <Link to="/welcome" className="text-xl font-bold">
          My App
        </Link>
        <button onClick={() => setIsOpen(true)} aria-label="Open Menu">
          <Menu size={26} />
        </button>
      </div>

      {/* 📱 Mobile overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-full lg:h-auto z-50
          transform ${isOpen ? "translate-x-0" : "-translate-x-64"}
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          w-64 bg-[#1a1110]/95 text-white flex flex-col justify-between border-r border-[#242124]
        `}
      >
        {/* Top section */}
        <div>
          <div className="hidden lg:block p-6 text-center border-b border-[#242124]">
            <Link
              to="/welcome"
              className="text-2xl font-extrabold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent hover:opacity-80 transition-all duration-300"
            >
              My App
            </Link>
          </div>

          {/* Mobile Close Button */}
          <div className="flex lg:hidden justify-end p-4">
            <button onClick={() => setIsOpen(false)} aria-label="Close Menu">
              <X size={26} />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="px-4 pb-6 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
            {links.map(({ to, label, icon, notif }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)} // 📱 auto-close sidebar
                  className={`relative flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300 group ${
                    isActive
                      ? "bg-gradient-to-r from-[#2a2a2a] to-[#3a3a3a] text-white font-semibold shadow-md"
                      : "text-gray-300 hover:bg-[#242124]"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r transition-all duration-300" />
                  )}

                  <span className="flex items-center gap-3">
                    <span
                      className={`transition-colors duration-300 ${
                        isActive ? "text-blue-400" : "text-gray-400 group-hover:text-gray-200"
                      }`}
                    >
                      {icon}
                    </span>
                    <span
                      className={`text-sm transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                          : ""
                      }`}
                    >
                      {label}
                    </span>
                  </span>

                  {notif && notifCount > 0 && (
                    <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full shadow-md animate-pulse">
                      {notifCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout button */}
        <div className="p-4 border-t border-[#242124]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg shadow-md transition-all duration-300"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
