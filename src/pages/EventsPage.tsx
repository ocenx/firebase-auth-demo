// src/pages/EventsPage.tsx
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { CalendarDays, Calendar, Users } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Record<string, boolean>>({});

  // ✅ Real-time events listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snap) => {
      const list: any[] = [];
      snap.forEach((docSnap) =>
        list.push({ id: docSnap.id, ...docSnap.data() })
      );
      setEvents(list);
    });
    return () => unsub();
  }, []);

  // ✅ Real-time bookings for this user
  useEffect(() => {
    if (!user) return;
    const unsubscribers: (() => void)[] = [];

    events.forEach((ev) => {
      const bookingRef = doc(db, "events", ev.id, "bookings", user.uid);
      const unsub = onSnapshot(bookingRef, (snap) => {
        setBookings((prev) => ({
          ...prev,
          [ev.id]: snap.exists(),
        }));
      });
      unsubscribers.push(unsub);
    });

    return () => unsubscribers.forEach((u) => u());
  }, [user, events]);

  // ✅ Book event
  const handleBook = async (eventId: string) => {
    if (!user) return alert("Login required!");
    if (bookings[eventId]) return alert("You already booked this event!");

    try {
      const eventRef = doc(db, "events", eventId);
      const bookingRef = doc(db, "events", eventId, "bookings", user.uid);

      await runTransaction(db, async (transaction) => {
        const eventSnap = await transaction.get(eventRef);
        if (!eventSnap.exists()) throw new Error("Event not found!");
        const data = eventSnap.data();

        if ((data?.slots ?? 0) <= 0) throw new Error("No slots available!");

        transaction.update(eventRef, { slots: (data.slots ?? 0) - 1 });
        transaction.set(bookingRef, {
          userId: user.uid,
          bookedAt: serverTimestamp(),
        });
      });

      alert("✅ Event booked!");
    } catch (err: any) {
      console.error(err);
      alert("Booking failed: " + err.message);
    }
  };

  // ✅ Cancel booking
  const handleCancel = async (eventId: string) => {
    if (!user) return;
    if (!bookings[eventId]) return;

    try {
      const eventRef = doc(db, "events", eventId);
      const bookingRef = doc(db, "events", eventId, "bookings", user.uid);

      await runTransaction(db, async (transaction) => {
        const eventSnap = await transaction.get(eventRef);
        if (!eventSnap.exists()) throw new Error("Event not found!");
        const data = eventSnap.data();

        transaction.update(eventRef, { slots: (data.slots ?? 0) + 1 });
        transaction.delete(bookingRef);
      });

      alert("❌ Booking cancelled!");
    } catch (err: any) {
      console.error(err);
      alert("Cancel failed: " + err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-[#1a1a1a] to-[#2b2b2b] text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Section */}
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 mb-6"
        >
          <CalendarDays className="w-6 h-6 text-gray-300" />
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
            Events
          </h1>
        </motion.div>

        {/* Events List */}
        <div className="space-y-4">
          {events.map((ev) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 md:p-5 rounded-2xl bg-[#1a1110]/80 border border-[#242124] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Event Info */}
              <div className="flex-1">
                <h2 className="text-base md:text-lg font-semibold text-gray-100">
                  {ev.title}
                </h2>
                <p className="text-sm md:text-base text-gray-400">
                  {ev.description}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs md:text-sm text-gray-500">
                    <Calendar className="w-4 h-4" /> {ev.date}
                  </span>
                  <span
                    className={`flex items-center gap-1 px-2 py-1 text-xs md:text-sm rounded-full font-medium ${
                      ev.slots > 0
                        ? "bg-green-600/80 text-white"
                        : "bg-red-600/80 text-white"
                    }`}
                  >
                    <Users className="w-4 h-4" /> {ev.slots} slots
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!bookings[ev.id] ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBook(ev.id)}
                    disabled={ev.slots <= 0}
                    className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base text-white shadow-md transition ${
                      ev.slots <= 0
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
                    }`}
                  >
                    {ev.slots > 0 ? "Book" : "Full"}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCancel(ev.id)}
                    className="px-3 md:px-4 py-2 rounded-lg text-sm md:text-base bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-md"
                  >
                    Cancel
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}

          {events.length === 0 && (
            <p className="text-gray-500 text-center text-sm md:text-base">
              No events available right now...
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
