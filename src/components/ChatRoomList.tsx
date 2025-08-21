// src/components/ChatRoomList.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../firebase";

type Props = { currentRoom: string };

export default function ChatRoomList({ currentRoom }: Props) {
  const [rooms, setRooms] = useState<Array<{ id: string; name: string }>>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const col = collection(db, "chatRooms");
    // realtime listener
    const unsub = onSnapshot(col, (snap) => {
      const r: Array<{ id: string; name: string }> = [];
      snap.forEach((doc) => {
        r.push({ id: doc.id, name: doc.data().name });
      });
      setRooms(r);
    });
    return () => unsub();
  }, []);

  const createRoom = async () => {
    if (!newName.trim()) return;
    try {
      await addDoc(collection(db, "chatRooms"), { name: newName.trim(), createdAt: new Date() });
      setNewName("");
      setCreating(false);
    } catch (err) {
      console.error("create room error", err);
      alert("Could not create room");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Rooms</h2>

      <ul className="space-y-2">
        {/* default general link */}
        <li>
          <Link
            to={`/chat/general`}
            className={`block px-3 py-2 rounded ${
              currentRoom === "general" ? "bg-blue-500 text-white" : "hover:bg-gray-100"
            }`}
          >
            # general
          </Link>
        </li>

        {rooms.map((r) => (
          <li key={r.id}>
            <Link
              to={`/chat/${r.id}`}
              className={`block px-3 py-2 rounded ${
                currentRoom === r.id ? "bg-blue-500 text-white" : "hover:bg-gray-100"
              }`}
            >
              {r.name}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        {!creating ? (
          <button
            onClick={() => setCreating(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            + Create room
          </button>
        ) : (
          <div className="mt-2 flex space-x-2">
            <input
              className="flex-1 border rounded p-2"
              placeholder="Room name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button onClick={createRoom} className="bg-blue-500 text-white px-3 rounded">
              Create
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
