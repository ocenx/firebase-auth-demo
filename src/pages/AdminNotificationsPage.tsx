import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import AdminNavbar from "../components/AdminNavbar";
import { Bell, Send, Trash2 } from "lucide-react";

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setNotifications(list);
    });
    return () => unsub();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    await addDoc(collection(db, "notifications"), {
      title,
      message,
      createdAt: serverTimestamp(),
    });
    setTitle("");
    setMessage("");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this notification?")) return;
    await deleteDoc(doc(db, "notifications", id));
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <AdminNavbar />
      <div className="flex-1 ml-64 p-8 space-y-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="text-red-400" /> Manage Notifications
        </h1>

        {/* Create Notification */}
        <form
          onSubmit={handleSend}
          className="space-y-4 p-6 border border-gray-800 rounded-2xl shadow bg-gray-900"
        >
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Send className="text-blue-400" /> Create Notification
          </h2>
          <input
            type="text"
            placeholder="Notification Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100"
          />
          <textarea
            placeholder="Notification Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100"
            rows={4}
          />
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Send size={18} /> Send Notification
          </button>
        </form>

        {/* Notifications List */}
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bell className="text-yellow-400" /> Sent Notifications
          </h2>
          {notifications.length === 0 ? (
            <p className="text-gray-400">No notifications sent yet.</p>
          ) : (
            <ul className="space-y-4 mt-4">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className="p-5 border border-gray-800 rounded-2xl shadow bg-gray-900 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{n.title}</h3>
                      <p className="text-gray-300">{n.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {n.createdAt?.toDate().toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="ml-4 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
