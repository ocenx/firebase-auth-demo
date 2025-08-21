// src/components/ChatRoom.tsx
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import { db } from "../firebase";
type Msg = {
  id: string;
  text: string;
  uid: string;
  displayName: string;
  photoURL?: string;
  createdAt: any;
  roomId: string;
};

export default function ChatRoom({ roomId }: { roomId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // listen to messages for this room ordered by timestamp
    const msgsRef = collection(db, "messages");
    const q = query(msgsRef, where("roomId", "==", roomId), orderBy("createdAt", "asc"), limit(200));

    const unsub = onSnapshot(q, (snap) => {
      const ms: Msg[] = [];
      snap.forEach((doc) => {
        const data = doc.data() as any;
        ms.push({
          id: doc.id,
          text: data.text,
          uid: data.uid,
          displayName: data.displayName,
          photoURL: data.photoURL,
          createdAt: data.createdAt,
          roomId: data.roomId,
        });
      });
      setMessages(ms);

      // scroll to bottom
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });

    return () => unsub();
  }, [roomId]);

  const handleSend = async (text: string) => {
    if (!user) return alert("You must be logged in");
    if (!text.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: text.trim(),
        uid: user.uid,
        displayName: user.displayName || "User",
        photoURL: user.photoURL || "",
        roomId,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("send message failed", err);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-lg shadow overflow-hidden">
      <header className="px-4 py-3 border-b">
        <h3 className="text-lg font-semibold">#{roomId}</h3>
      </header>

      <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="text-sm text-gray-500">No messages yet. Say hi 👋</div>
        ) : (
          messages.map((m) => <ChatMessage key={m.id} message={m} currentUserId={user?.uid} />)
        )}
        <div ref={bottomRef} />
      </div>

      <footer className="p-3 border-t">
        <ChatInput onSend={handleSend} />
      </footer>
    </div>
  );
}
