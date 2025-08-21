// src/pages/NotificationsPage.tsx
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { Bell } from "lucide-react";
import Sidebar from "../components/Sidebar";

type Notification = {
  id: string;
  title?: string;
  message?: string;
  createdAt?: { toDate: () => Date };
  readBy?: string[];
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: Notification[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title,
          message: data.message,
          createdAt: data.createdAt,
          readBy: data.readBy || [],
        });
      });
      setNotifications(list);
    });

    return () => unsub();
  }, [user]);

  const toggleRead = async (id: string, notif: Notification) => {
    if (!user) return;
    const ref = doc(db, "notifications", id);
    const isUnread = !notif.readBy?.includes(user.uid);

    let newReadBy;
    if (isUnread) {
      newReadBy = [...(notif.readBy || []), user.uid]; // mark as read
    } else {
      newReadBy = (notif.readBy || []).filter((uid) => uid !== user.uid); // mark as unread
    }

    await updateDoc(ref, { readBy: newReadBy });

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readBy: newReadBy } : n))
    );
  };

  const toggleAll = async () => {
    if (!user) return;
    const allRead = notifications.every((n) => n.readBy?.includes(user.uid));

    const updates = notifications.map(async (notif) => {
      const ref = doc(db, "notifications", notif.id);
      if (allRead) {
        const newReadBy = (notif.readBy || []).filter((uid) => uid !== user.uid);
        await updateDoc(ref, { readBy: newReadBy });
      } else {
        if (!notif.readBy?.includes(user.uid)) {
          const newReadBy = [...(notif.readBy || []), user.uid];
          await updateDoc(ref, { readBy: newReadBy });
        }
      }
    });

    await Promise.all(updates);
  };

  const allRead = user
    ? notifications.length > 0 &&
      notifications.every((n) => n.readBy?.includes(user.uid))
    : false;

  return (
    <div className="flex min-h-screen bg-[#121212] text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> Notifications
          </h1>
          {notifications.length > 0 && (
            <button
              onClick={toggleAll}
              className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-600 bg-background text-gray-300 hover:text-white hover:border-gray-400 transition"
            >
              {allRead ? "Mark all as unread" : "Mark all as read"}
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-gray-400">No notifications yet.</p>
          ) : (
            notifications.map((notif) => {
              const isUnread = !notif.readBy?.includes(user?.uid || "");
              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border transition-all duration-300 relative shadow-md flex flex-col sm:flex-row sm:items-start justify-between gap-3
                    ${
                      isUnread
                        ? "border-red-500/70 bg-[#1a1a1a] shadow-red-500/30 animate-glow"
                        : "border-gray-700 bg-[#1e1e1e] hover:bg-[#2a2a2a]"
                    }`}
                >
                  {/* Left: Content */}
                  <Link to={`/notifications/${notif.id}`} className="flex-1">
                    <div className="flex justify-between items-center">
                      <h2 className="font-semibold text-base sm:text-lg">
                        {notif.title ?? "Untitled"}
                      </h2>
                      {isUnread && (
                        <span className="bg-gradient-to-r from-red-500 to-orange-500 text-xs px-2 py-0.5 rounded-full shadow-md animate-pulse">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                      {notif.message ?? "No message"}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {notif.createdAt
                        ? notif.createdAt.toDate().toLocaleString()
                        : "Just now"}
                    </p>
                  </Link>

                  {/* Right: Toggle button */}
                  <button
                    onClick={() => toggleRead(notif.id, notif)}
                    className="self-end sm:self-center text-xs px-2 py-1 border border-gray-600 rounded-md text-gray-300 hover:text-white hover:border-gray-400 transition"
                  >
                    {isUnread ? "Mark as read" : "Mark as unread"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
