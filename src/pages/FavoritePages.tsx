// src/pages/FavoritesPage.tsx
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      setLoading(true);
      const favSnap = await getDocs(
        collection(db, `users/${user.uid}/favorites`)
      );
      const favIds: string[] = favSnap.docs.map((d) => d.id);

      const favProducts: any[] = [];
      for (const id of favIds) {
        const productDoc = await getDoc(doc(db, "products", id));
        if (productDoc.exists()) {
          favProducts.push({ id: productDoc.id, ...productDoc.data() });
        }
      }

      setFavorites(favProducts);
      setLoading(false);
    };

    fetchFavorites();
  }, [user]);

  // ✅ Remove from favorites
  const removeFavorite = async (productId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/favorites/${productId}`));

    // Locally update with animation
    setFavorites((prev) => prev.filter((p) => p.id !== productId));
  };

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-black via-[#1a1a1a] to-[#2b2b2b] text-white">
        <Sidebar />
        <main className="flex-1 p-10">
          <p className="text-red-500">Please log in to view your favorites.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-[#1a1a1a] to-[#2b2b2b] text-white">
      {/* Sidebar (consistent design) */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto bg-[#1a1110]/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-[#242124] p-8"
        >
          {/* Page Title */}
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
            <Heart className="w-6 h-6 text-red-500" /> My Favorites
          </h1>

          {/* Skeleton Loader */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 border border-[#242124] rounded-xl shadow-md bg-[#242124]/60 min-h-[320px] animate-pulse flex flex-col"
                >
                  <div className="w-full h-40 bg-gray-700 rounded-lg" />
                  <div className="mt-3 space-y-2 flex-1">
                    <div className="h-5 bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-700 rounded w-1/2" />
                    <div className="h-4 bg-gray-700 rounded w-1/3 mt-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <p className="text-gray-400 italic text-center">
              You don’t have any favorites yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <AnimatePresence>
                {favorites.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="relative group p-4 border border-[#242124] rounded-xl shadow-md bg-[#242124]/60 hover:border-gray-600 transition flex flex-col justify-between min-h-[320px]"
                  >
                    {/* Product image */}
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    )}

                    {/* Product info */}
                    <div className="mt-3 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-white group-hover:text-red-400 transition line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {p.description}
                      </p>
                      <p className="font-semibold text-green-400 mt-auto">
                        ${p.price}
                      </p>
                    </div>

                    {/* Remove favorite button */}
                    <button
                      onClick={() => removeFavorite(p.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition"
                    >
                      <Heart size={18} className="fill-current text-white" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
