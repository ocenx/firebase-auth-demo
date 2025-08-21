// src/pages/MyPostsPage.tsx
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
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
  authorEmail?: string;
  createdAt: any;
};

const MyPostsPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "posts"),
      where("authorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const docs: Post[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Post, "id">),
      }));
      setPosts(docs);
    });

    return unsub;
  }, [user]);

  const handleEdit = (post: Post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    await updateDoc(doc(db, "posts", editingId), {
      title,
      content,
    });

    setEditingId(null);
    setTitle("");
    setContent("");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this post?")) {
      await deleteDoc(doc(db, "posts", id));
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-[#1a1a1a] to-[#2b2b2b] text-white">
      <Sidebar />

      <main className="flex-1 p-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-[#1a1110]/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-[#242124] p-8"
        >
          {/* Page Title */}
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
            <NotebookPen className="w-6 h-6 text-white" /> My Posts
          </h1>

          {/* Edit Form (only shows when editing) */}
          {editingId && (
            <form
              onSubmit={handleUpdate}
              className="mb-8 space-y-4 bg-[#242124]/60 p-4 rounded-xl border border-[#242124]"
            >
              <input
                className="w-full border border-gray-600 bg-[#1a1a1a] text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                className="w-full border border-gray-600 bg-[#1a1a1a] text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Update Post
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTitle("");
                    setContent("");
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Posts List */}
          {posts.length === 0 ? (
            <p className="text-gray-400">You haven’t created any posts yet.</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 border border-[#242124] rounded-xl shadow-md bg-[#242124]/60"
                >
                  <h2 className="font-bold text-xl text-white mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-300">{post.content}</p>
                  <p className="text-xs text-gray-500 mt-3">
                    By: {post.authorEmail ?? "Unknown"} •{" "}
                    {post.createdAt?.toDate().toLocaleString()}
                  </p>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(post)}
                      className="text-sm bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-black transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white transition"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default MyPostsPage;
