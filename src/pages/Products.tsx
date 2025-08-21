// src/pages/ProductsPage.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, Heart } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const hasMore = useRef(true);
  const { user } = useAuth();

  // ✅ Initial load with pagination
  const fetchProducts = async () => {
    if (!hasMore.current) return;

    setIsFetchingMore(true);
    const q = lastDoc
      ? query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(6)
        )
      : query(collection(db, "products"), orderBy("createdAt", "desc"), limit(6));

    const snap = await getDocs(q);

    if (snap.empty) {
      hasMore.current = false;
    } else {
      const newProducts = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // ✅ Prevent duplicates by filtering out already-added products
      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filtered = newProducts.filter((p) => !existingIds.has(p.id));
        return [...prev, ...filtered];
      });

      setLastDoc(snap.docs[snap.docs.length - 1]);
    }
    setIsFetchingMore(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Live favorites fetch
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    const favRef = collection(db, `users/${user.uid}/favorites`);
    const unsub = onSnapshot(favRef, (snap) => {
      const favs: string[] = [];
      snap.forEach((d) => favs.push(d.id));
      setFavorites(favs);
    });
    return () => unsub();
  }, [user]);

  // ✅ Toggle favorite
  const toggleFavorite = async (productId: string) => {
    if (!user) {
      alert("Please login to add favorites");
      return;
    }
    const favRef = doc(db, `users/${user.uid}/favorites/${productId}`);
    if (favorites.includes(productId)) {
      await deleteDoc(favRef);
    } else {
      await setDoc(favRef, {
        productId,
        addedAt: serverTimestamp(),
      });
    }
  };

  // ✅ Infinite scroll listener
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200 &&
      !isFetchingMore &&
      hasMore.current
    ) {
      fetchProducts();
    }
  }, [isFetchingMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

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
          {/* Page title */}
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
            <ShoppingBag className="w-6 h-6 text-white" /> Products
          </h1>

          {/* Skeleton loader */}
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
          ) : products.length === 0 ? (
            <p className="text-gray-400 italic text-center">
              No products available.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => {
                const isFav = favorites.includes(p.id);
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
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
                      <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {p.description}
                      </p>
                      <p className="font-semibold text-green-400 mt-auto">
                        ${p.price}
                      </p>
                    </div>

                    {/* Favorite button */}
                    {user && (
                      <button
                        onClick={() => toggleFavorite(p.id)}
                        className={`absolute top-3 right-3 p-2 rounded-full transition ${
                          isFav
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        }`}
                      >
                        <Heart
                          size={18}
                          className={isFav ? "fill-current text-white" : ""}
                        />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Loading more indicator */}
          {isFetchingMore && (
            <p className="text-center text-gray-400 mt-6">Loading more...</p>
          )}
        </motion.div>
      </main>
    </div>
  );
}
