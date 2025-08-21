// src/pages/AdminFeedbackPage.tsx
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import AdminNavbar from "../components/AdminNavbar";
import { Star, MessageSquare, Trash2 } from "lucide-react";

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [average, setAverage] = useState<number>(0);

  const fetchFeedbacks = async () => {
    const snap = await getDocs(collection(db, "feedback"));
    const list: any[] = [];
    let total = 0;

    snap.forEach((d) => {
      const data = d.data();
      list.push({ id: d.id, ...data });
      total += data.rating;
    });

    setFeedbacks(list);
    setAverage(list.length > 0 ? total / list.length : 0);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this feedback?")) return;
    await deleteDoc(doc(db, "feedback", id));
    fetchFeedbacks();
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <AdminNavbar />
      <div className="flex-1 ml-64 p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Star size={32} className="text-yellow-400" />
          <h1 className="text-3xl font-bold">Feedback & Ratings</h1>
        </div>

        {/* Average Rating */}
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl shadow space-y-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star size={20} className="text-yellow-400" />
            Average Rating
          </h2>
          <p className="text-2xl font-bold text-yellow-400">
            {average.toFixed(1)} / 5 ⭐
          </p>
        </div>

        {/* Feedback List */}
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-400" />
            User Feedback
          </h2>
          {feedbacks.length === 0 ? (
            <p className="text-gray-400 mt-2">No feedback submitted yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              {feedbacks.map((f) => (
                <div
                  key={f.id}
                  className="p-5 bg-gray-900 border border-gray-800 rounded-2xl shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-yellow-400">
                        {"⭐".repeat(f.rating)}
                      </p>
                      <p className="text-gray-200 mt-1">{f.comment}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {f.createdAt?.toDate
                          ? f.createdAt.toDate().toLocaleString()
                          : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
