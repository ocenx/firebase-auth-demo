// src/pages/FeedbackPage.tsx
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { Star, Trash2, Edit } from "lucide-react";
import Sidebar from "../components/Sidebar";

type Feedback = {
  id: string;
  userId?: string;
  rating: number;
  comment?: string;
  createdAt?: { toDate: () => Date };
};

export default function FeedbackPage() {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [editing, setEditing] = useState(false);

  // 🔄 Fetch feedbacks in realtime
  useEffect(() => {
    const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: Feedback[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          userId: data.userId,
          rating: data.rating,
          comment: data.comment,
          createdAt: data.createdAt,
        });
      });
      setFeedbacks(list);

      // ✅ Compute average rating
      if (list.length > 0) {
        const avg =
          list.reduce((sum, f) => sum + (f.rating || 0), 0) / list.length;
        setAvgRating(avg);
      } else {
        setAvgRating(0);
      }
    });

    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !user?.uid) return;

    const ref = doc(db, "feedback", user.uid);

    if (editing) {
      await updateDoc(ref, { rating, comment });
      setEditing(false);
    } else {
      await setDoc(ref, {
        userId: user.uid,
        rating,
        comment,
        createdAt: new Date(),
      });
    }

    setRating(0);
    setComment("");
  };

  const handleEdit = (f: Feedback) => {
    setRating(f.rating);
    setComment(f.comment || "");
    setEditing(true);
  };

  const handleDelete = async () => {
    if (!user?.uid) return;
    await deleteDoc(doc(db, "feedback", user.uid));
    setRating(0);
    setComment("");
    setEditing(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-[#1a1a1a] to-[#2b2b2b] text-white">
      {/* Sidebar (hidden on small screens) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" /> Feedback
            & Ratings
          </h1>
          {feedbacks.length > 0 && (
            <span className="text-xs sm:text-sm text-gray-400">
              {feedbacks.length} feedback(s)
            </span>
          )}
        </div>

        {/* Average Rating */}
        <div className="mb-6 sm:mb-8 bg-[#1e1e1e]/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold mb-3">
            Average Rating
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold text-yellow-400">
              {avgRating.toFixed(1)}
            </span>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={`${
                    i < Math.round(avgRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-[#1e1e1e]/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-700"
        >
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            {editing ? "Edit Your Feedback" : "Leave Feedback"}
          </h2>

          {/* Rating Stars */}
          <div className="flex gap-2 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setRating(i + 1)}
                className={`transition-colors ${
                  i < rating
                    ? "text-yellow-400"
                    : "text-gray-500 hover:text-yellow-300"
                }`}
              >
                <Star
                  size={24}
                  className={i < rating ? "fill-yellow-400" : ""}
                />
              </button>
            ))}
          </div>

          {/* Comment Box */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your feedback..."
            className="w-full p-2 sm:p-3 rounded-lg bg-[#2a2a2a] border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 mb-4 text-sm sm:text-base"
          />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg shadow-md transition-all text-sm sm:text-base"
            >
              {editing ? "Update" : "Submit"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 rounded-lg shadow-md flex items-center justify-center gap-1 text-sm sm:text-base"
              >
                <Trash2 size={16} /> Delete
              </button>
            )}
          </div>
        </form>

        {/* Feedback List */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">
            User Feedback
          </h2>
          {feedbacks.length === 0 ? (
            <p className="text-gray-400 text-sm sm:text-base">
              No feedback yet.
            </p>
          ) : (
            feedbacks.map((f) => (
              <div
                key={f.id}
                className="p-3 sm:p-4 bg-[#1a1a1a] rounded-xl border border-gray-700 shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  {/* Stars */}
                  <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={`${
                          i < f.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Edit/Delete for owner */}
                  {user?.uid === f.userId && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(f)}
                        className="text-blue-400 hover:text-blue-500 flex items-center gap-1 text-xs sm:text-sm"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="text-red-400 hover:text-red-500 flex items-center gap-1 text-xs sm:text-sm"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Comment */}
                <p className="text-gray-300 text-sm sm:text-base mt-2">
                  {f.comment || "No comment"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {f.createdAt
                    ? f.createdAt.toDate().toLocaleString()
                    : "Just now"}
                </p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
