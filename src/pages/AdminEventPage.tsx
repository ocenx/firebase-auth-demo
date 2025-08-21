import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<number>(10);

  const fetchEvents = async () => {
    const snap = await getDocs(collection(db, "events"));
    const list: any[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    setEvents(list);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    if (!title || !description || !date) {
      return alert("All fields are required!");
    }
    try {
      await addDoc(collection(db, "events"), {
        title,
        description,
        date,
        slots,
        createdAt: new Date(),
      });
      setTitle("");
      setDescription("");
      setDate("");
      setSlots(10);
      await fetchEvents();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteDoc(doc(db, "events", id));
      await fetchEvents();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleUpdateSlots = async (id: string, newSlots: number) => {
    try {
      await updateDoc(doc(db, "events", id), { slots: newSlots });
      await fetchEvents();
    } catch (err: any) {
      alert("Update failed: " + err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <AdminNavbar />
      <div className="flex-1 ml-64 p-8 space-y-8">
        <h1 className="text-3xl font-bold">📅 Manage Events</h1>

        {/* Add Event */}
        <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4 shadow">
          <h2 className="text-xl font-semibold">➕ Add New Event</h2>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400 text-gray-100"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400 text-gray-100"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
          />
          <input
            type="number"
            value={slots}
            onChange={(e) => setSlots(Number(e.target.value))}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
          />
          <button
            onClick={handleAddEvent}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Event
          </button>
        </div>

        {/* Event List */}
        <div>
          <h2 className="text-xl font-semibold">📋 Current Events</h2>
          {events.length === 0 ? (
            <p className="text-gray-400">No events yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-5 bg-gray-900 border border-gray-800 rounded-2xl shadow flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-lg">{ev.title}</h3>
                    <p className="text-sm text-gray-400">{ev.description}</p>
                    <p className="text-sm text-gray-500">
                      {ev.date} | Slots: {ev.slots}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleUpdateSlots(ev.id, Number(ev.slots || 0) + 1)
                      }
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      + Slot
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateSlots(
                          ev.id,
                          Math.max(0, Number(ev.slots || 0) - 1)
                        )
                      }
                      className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                      - Slot
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
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
