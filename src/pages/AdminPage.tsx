// src/pages/AdminDashboardPage.tsx
import AdminNavbar from "../components/AdminNavbar";
import { LayoutDashboard, Users, FileText, Calendar, Bell } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <AdminNavbar />

      <div className="flex-1 ml-64 p-8 space-y-8">
        {/* Title */}
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <LayoutDashboard className="text-blue-400" /> Admin Dashboard
        </h1>

        {/* Cards Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow flex flex-col items-center">
            <Users className="text-green-400 mb-3" size={28} />
            <h2 className="text-xl font-semibold">Users</h2>
            <p className="text-gray-400 text-sm">Manage all registered users</p>
          </div>

          <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow flex flex-col items-center">
            <FileText className="text-purple-400 mb-3" size={28} />
            <h2 className="text-xl font-semibold">Files</h2>
            <p className="text-gray-400 text-sm">Uploaded documents</p>
          </div>

          <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow flex flex-col items-center">
            <Calendar className="text-yellow-400 mb-3" size={28} />
            <h2 className="text-xl font-semibold">Events</h2>
            <p className="text-gray-400 text-sm">Track upcoming events</p>
          </div>

          <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow flex flex-col items-center">
            <Bell className="text-red-400 mb-3" size={28} />
            <h2 className="text-xl font-semibold">Notifications</h2>
            <p className="text-gray-400 text-sm">Send alerts to users</p>
          </div>
        </div>
      </div>
    </div>
  );
}
