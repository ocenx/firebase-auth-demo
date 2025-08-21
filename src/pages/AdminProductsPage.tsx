// src/pages/AdminProductsPage.tsx
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import AdminNavbar from "../components/AdminNavbar";
import { ShoppingCart, Plus, Trash2 } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // ✅ Fetch products (unchanged logic)
  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Cloudinary upload (keep your original upload flow)
  const uploadImageToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned"); // ⚠️ Replace with your unsigned preset if needed

    const res = await fetch("https://api.cloudinary.com/v1_1/demghzhem/image/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Image upload failed");
    const data = await res.json();
    return data.secure_url;
  };

  // ✅ Add new product (with image upload) — logic preserved
  const handleAddProduct = async () => {
    if (!name || !description || price <= 0 || !imageFile) {
      return alert("All fields are required!");
    }
    try {
      setUploading(true);
      const imageUrl = await uploadImageToCloudinary(imageFile);

      await addDoc(collection(db, "products"), {
        name,
        price,
        description,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      setName("");
      setPrice(0);
      setDescription("");
      setImageFile(null);

      await fetchProducts();
      alert("✅ Product created!");
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // ✅ Delete product (unchanged)
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      await fetchProducts();
      alert("🗑️ Product deleted!");
    } catch (err: any) {
      console.error(err);
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <AdminNavbar />
      <div className="flex-1 ml-64 p-8 space-y-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingCart className="text-blue-400" /> Manage Products
        </h1>

        {/* Add Product */}
        <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4 shadow">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Plus className="text-green-400" /> Add Product
          </h2>

          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-400"
          />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full"
          />

          <button
            onClick={handleAddProduct}
            disabled={uploading}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60"
          >
            {uploading ? "Uploading..." : <><Plus size={16} /> Add Product</>}
          </button>
        </div>

        {/* Product List */}
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ShoppingCart className="text-yellow-400" /> Product List
          </h2>

          {products.length === 0 ? (
            <p className="text-gray-400">No products yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="p-5 bg-gray-900 border border-gray-800 rounded-2xl shadow flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-bold text-lg">{p.name}</h3>
                      <p className="text-sm text-gray-400">${p.price}</p>
                      {p.description && (
                        <p className="text-sm text-gray-400 truncate max-w-xs">{p.description}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
