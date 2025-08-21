import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.displayName || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState(user?.photoURL || "");
  const navigate = useNavigate();

  // 🚀 Redirect admins straight to dashboard
  useEffect(() => {
    if (user?.isAdmin) {
      navigate("/admin");
    }
  }, [user, navigate]);

  // ✅ Update profile info + avatar
  const handleUpload = async () => {
    try {
      let uploadedUrl = preview;

      if (avatar) {
        const data = new FormData();
        data.append("file", avatar);
        data.append("upload_preset", "unsigned");

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/demghzhem/image/upload",
          { method: "POST", body: data }
        );
        const file = await res.json();
        uploadedUrl = file.secure_url;
      }

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
          photoURL: uploadedUrl,
        });
      }

      await refreshUser();
      setPreview(uploadedUrl);
      alert("✅ Profile updated!");
    } catch (err) {
      console.error("Profile update failed:", err);
      alert("Something went wrong!");
    }
  };

  if (user?.isAdmin) {
    return null;
  }

  // ✨ Fallbacks
  const displayName =
    name || user?.displayName || (user?.email ? user.email.split("@")[0] : "User");
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-[#1a1a1a] to-[#2b2b2b] text-white">
      {/* Sidebar stays fixed */}
      <Sidebar />

      {/* Profile Content */}
      <main className="flex-1 p-8 flex justify-center items-center overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl bg-[#1a1110]/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-[#242124] p-8 flex flex-col items-center"
        >
          {/* Avatar */}
          {preview ? (
            <img
              src={preview}
              alt="Avatar"
              className="w-28 h-28 rounded-full border-4 border-[#353839] shadow-lg mb-4 object-cover"
            />
          ) : (
            <div
              className="w-28 h-28 rounded-full border-4 border-[#353839] shadow-lg mb-4 flex items-center justify-center 
                         bg-gradient-to-br from-blue-500 to-purple-600 text-white text-4xl font-bold"
            >
              {avatarInitial}
            </div>
          )}

          {/* Name */}
          <input
            type="text"
            className="w-full p-3 rounded-lg bg-[#242124] text-white placeholder-gray-400 
                      focus:outline-none focus:ring-2 focus:ring-[#353839] transition mb-3"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* File Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            className="mb-4 w-full text-sm text-gray-400"
          />

          {/* Save Profile */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleUpload}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#242124] to-[#353839] 
                       text-white px-4 py-3 rounded-lg shadow-md transition"
          >
            <Save size={18} /> Save Profile
          </motion.button>

          <p className="text-sm text-gray-400 mt-6 text-center">
            Logged in as <span className="font-semibold">{user?.email}</span>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
