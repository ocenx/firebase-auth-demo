// src/pages/ChatPage.tsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Send, MessageSquare } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function ChatPage() {
  const { user } = useAuth();
  const { roomId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const messagesRef = roomId
      ? collection(db, "chatRooms", roomId, "messages")
      : collection(db, "messages");

    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const messagesRef = roomId
      ? collection(db, "chatRooms", roomId, "messages")
      : collection(db, "messages");

    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      uid: user?.uid,
      displayName: user?.displayName,
      photoURL: user?.photoURL,
    });

    setNewMessage("");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-[#1a1a1a] to-[#2b2b2b] text-white">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Chat Section */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 md:p-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 mb-4 sm:mb-6"
        >
          <MessageSquare className="w-6 h-6 text-gray-300" />
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
            Chat {roomId && ` - ${roomId}`}
          </h1>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-[#1a1110]/80 rounded-2xl border border-[#242124] shadow-lg">
          {messages.map((msg) => {
            const isOwnMessage = msg.uid === user?.uid;
            const initials = msg.displayName
              ? msg.displayName.charAt(0).toUpperCase()
              : "?";

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                {/* Avatar left (other users) */}
                {!isOwnMessage && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-200 overflow-hidden">
                    {msg.photoURL ? (
                      <img
                        src={msg.photoURL}
                        alt={msg.displayName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={`max-w-[75%] sm:max-w-xs p-3 rounded-2xl shadow-md break-words ${
                    isOwnMessage
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                      : "bg-[#242124]/70 text-gray-200"
                  }`}
                >
                  <p className="text-xs font-semibold mb-1">
                    {msg.displayName}
                  </p>
                  <p className="text-sm">{msg.text}</p>
                </div>

                {/* Avatar right (own messages) */}
                {isOwnMessage && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-200 overflow-hidden">
                    {msg.photoURL ? (
                      <img
                        src={msg.photoURL}
                        alt={msg.displayName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}

          {messages.length === 0 && (
            <p className="text-gray-500 text-center text-sm">
              No messages yet...
            </p>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Box (fixed at bottom) */}
        <form
          onSubmit={sendMessage}
          className="mt-4 flex items-center gap-3 bg-[#1a1110]/90 p-3 rounded-2xl border border-[#242124]"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 text-sm"
            placeholder={`Message ${
              roomId ? "in room " + roomId : "everyone"
            }...`}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg disabled:opacity-50 transition"
          >
            <Send className="w-5 h-5 text-white" />
          </motion.button>
        </form>
      </main>
    </div>
  );
}
