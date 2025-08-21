// src/pages/FilesPage.tsx
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Upload, File as FileIcon, Download, FileText } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function FilesPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  // ✅ Load user's files in real-time
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "files"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setFiles(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "unsigned"); // 🔥 replace with your Cloudinary preset

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://api.cloudinary.com/v1_1/demghzhem/upload");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const res = JSON.parse(xhr.responseText);

          await addDoc(collection(db, "files"), {
            uid: user.uid,
            fileName: file.name,
            url: res.secure_url,
            createdAt: new Date(),
          });

          setFile(null);
          setProgress(0);
        } else {
          alert("Upload failed.");
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        alert("Upload error!");
        setUploading(false);
      };

      xhr.send(data);
    } catch (err) {
      console.error("Upload error:", err);
      setUploading(false);
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-black via-[#1a1a1a] to-[#2b2b2b] text-white">
      {/* Sidebar fixed */}
      <div className="fixed top-0 left-0 h-full w-64">
        <Sidebar />
      </div>

      {/* Main scrollable content */}
      <main className="ml-64 flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md sm:max-w-lg md:max-w-3xl mx-auto 
                     bg-[#1a1110]/90 backdrop-blur-lg rounded-2xl shadow-2xl 
                     border border-[#242124] p-4 sm:p-6 md:p-8"
        >
          {/* Header */}
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-center bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
            📂 File Uploads
          </h1>

          {/* Upload Box */}
          <div className="mb-6 flex flex-col items-center">
            <label className="w-full cursor-pointer flex flex-col items-center justify-center p-4 sm:p-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-400 transition text-center">
              <Upload size={28} className="mb-2 text-gray-400" />
              <span className="text-gray-400 text-sm sm:text-base truncate max-w-[90%]">
                {file ? file.name : "Click to select a file"}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleUpload}
              disabled={!file || uploading}
              className="mt-4 px-4 sm:px-6 py-2 sm:py-3 rounded-lg 
                         bg-gradient-to-r from-[#242124] to-[#353839] 
                         shadow-md hover:shadow-lg transition 
                         disabled:opacity-50 text-sm sm:text-base"
            >
              {uploading ? "Uploading..." : "Upload"}
            </motion.button>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-6">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-green-500 h-2.5 rounded-full"
              ></motion.div>
            </div>
          )}

          {/* File List */}
          <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-300" />
            Your Files
          </h2>
          <ul className="space-y-3">
            {files.map((f) => (
              <motion.li
                key={f.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center 
                           gap-3 sm:gap-0 bg-[#242124]/60 px-4 py-3 rounded-lg shadow-md"
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <FileIcon className="text-gray-400 shrink-0" size={20} />
                  <span className="text-sm sm:text-base break-words max-w-[80%] sm:max-w-none">
                    {f.fileName}
                  </span>
                </div>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition text-sm sm:text-base"
                >
                  <Download size={16} /> Download
                </a>
              </motion.li>
            ))}

            {files.length === 0 && (
              <p className="text-gray-400 text-center mt-6 text-sm sm:text-base">
                No files uploaded yet. 📤
              </p>
            )}
          </ul>
        </motion.div>
      </main>
    </div>
  );
}
