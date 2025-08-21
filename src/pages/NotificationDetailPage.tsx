// src/pages/NotificationDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { Bell, ArrowLeft } from "lucide-react";

type Notification = {
  id: string;
  title?: string;
  message?: string;
  createdAt?: { toDate: () => Date };
  readBy?: string[];
};

export default function NotificationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (!id || !user) return;

    const fetchNotif = async () => {
      const ref = doc(db, "notifications", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        let readBy = data.readBy || [];

        // Mark as read if not already
        if (!readBy.includes(user.uid)) {
          readBy = [...readBy, user.uid];
          await updateDoc(ref, { readBy });
        }

        setNotification({
          id: snap.id,
          title: data.title,
          message: data.message,
          createdAt: data.createdAt,
          readBy,
        });
      }
    };

    fetchNotif();
  }, [id, user]);

  if (!notification) {
    return (
      <div className="flex min-h-screen bg-[#121212] text-white">
        <Sidebar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <p className="text-gray-400">Loading notification...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#121212] text-white">
      {/* Sidebar (hidden on small screens, slide-in on larger) */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {/* Back button */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/notifications")}
            className="flex items-center gap-2 text-sm sm:text-base text-gray-300 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        </div>

        {/* Page Title */}
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 mb-6">
          <Bell className="w-6 h-6 text-white" /> Notification Details
        </h1>

        {/* Notification Card */}
        <div className="p-4 sm:p-6 rounded-xl shadow-lg border border-gray-700 bg-[#1e1e1e] hover:bg-[#2a2a2a] transition">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">
            {notification.title ?? "Untitled"}
          </h2>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">
            {notification.message ?? "No message available"}
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            {notification.createdAt
              ? notification.createdAt.toDate().toLocaleString()
              : "Just now"}
          </p>
        </div>
      </main>
    </div>
  );
}
