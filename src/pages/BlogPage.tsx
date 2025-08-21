// src/pages/BlogPage.tsx
import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { NotebookPen } from "lucide-react";
import { motion } from "framer-motion";

type Post = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: any;
  authorEmail?: string;
};

const BlogPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const docs: Post[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Post, "id">),
      }));
      setPosts(docs);
    });
    return unsub;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Login required");

    if (editingId) {
      await updateDoc(doc(db, "posts", editingId), {
        title,
        content,
      });
      setEditingId(null);
    } else {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        authorId: user.uid,
        createdAt: serverTimestamp(),
        authorEmail: user.email,
      });
    }

    setTitle("");
    setContent("");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-[#1a1a1a] to-[#2b2b2b] text-white">
      {/* Sidebar (fixed, full height) */}
      <div className="hidden md:block w-64 flex-shrink-0 border-r border-[#242124]">
        <Sidebar />
      </div>

      {/* Main content (scrollable) */}
      <main className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-[#1a1110]/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-[#242124] p-4 sm:p-6 md:p-8"
        >
          {/* Page Title */}
          <h1 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2 text-white">
            <NotebookPen className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> Blog
            Posts
          </h1>

          {/* Post Form */}
          {user && (
            <form
              onSubmit={handleSubmit}
              className="mb-8 space-y-4 bg-[#242124]/60 p-4 rounded-xl border border-[#242124]"
            >
              <input
                className="w-full border border-gray-600 bg-[#1a1a1a] text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                className="w-full border border-gray-600 bg-[#1a1a1a] text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                required
              />
              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm sm:text-base"
              >
                {editingId ? "Update Post" : "Create Post"}
              </button>
            </form>
          )}

          {/* Posts List */}
          <div className="space-y-6">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 sm:p-6 border border-[#242124] rounded-xl shadow-md bg-[#242124]/60"
              >
                <h2 className="font-bold text-lg sm:text-xl text-white mb-2 break-words">
                  {post.title}
                </h2>
                <p className="text-gray-300 text-sm sm:text-base whitespace-pre-wrap break-words">
                  {post.content}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-3">
                  By: {post.authorEmail ?? "Unknown"}{" "}
                  {user?.uid === post.authorId && (
                    <span className="text-green-400 font-semibold">(You)</span>
                  )}{" "}
                  • {post.createdAt?.toDate().toLocaleString()}
                </p>
              </motion.div>
            ))}
            {posts.length === 0 && (
              <p className="text-gray-500 text-center text-sm sm:text-base">
                No posts yet...
              </p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default BlogPage;
