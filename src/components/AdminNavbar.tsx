// src/components/AdminNavbar.tsx
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Bell,
  FileText,
  Users,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="fixed left-0 top-0 w-64 h-full bg-gray-900 border-r border-gray-800 p-6 flex flex-col">
      <h1 className="text-2xl font-bold text-white mb-8">Admin Panel</h1>

      <nav className="flex-1 space-y-4">
        <Link
          to="/admin"
          className="flex items-center gap-3 text-gray-300 hover:text-white"
        >
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link
          to="/admin/products"
          className="flex items-center gap-3 text-gray-300 hover:text-white"
        >
          <Package size={20} /> Products
        </Link>
        <Link
          to="/admin/notifications"
          className="flex items-center gap-3 text-gray-300 hover:text-white"
        >
          <Bell size={20} /> Notifications
        </Link>
       
        <Link
          to="/admin/events"
          className="flex items-center gap-3 text-gray-300 hover:text-white"
        >
          <Users size={20} /> Events
        </Link>
        <Link
          to="/admin/feedback"
          className="flex items-center gap-3 text-gray-300 hover:text-white"
        >
          <MessageSquare size={20} /> Feedback
        </Link>
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-auto flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        <LogOut size={20} /> Logout
      </button>
    </div>
  );
}
