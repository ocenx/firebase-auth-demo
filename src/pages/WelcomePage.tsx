import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";

const WelcomePage: React.FC = () => {
  const { user } = useAuth();

  // 📝 Extract first name or fallback
  const firstName =
    user?.displayName?.split(" ")[0] ||
    (user?.email ? user.email.split("@")[0] : "User");

  // 🧑 Generate avatar fallback (first letter of firstName)
  const avatarInitial = firstName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-[#1a1a1a] to-[#2b2b2b] text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-10 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl bg-[#1a1110]/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-[#242124] p-10"
        >
          {/* Avatar */}
          {user?.photoURL ? (
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              src={user.photoURL}
              alt="Avatar"
              className="w-24 h-24 rounded-full mb-4 shadow-md border border-gray-700 mx-auto"
            />
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-24 h-24 rounded-full mb-4 shadow-md border border-gray-700 mx-auto flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold"
            >
              {avatarInitial}
            </motion.div>
          )}

          {/* Greeting */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold mb-2"
          >
            Welcome, {firstName}!
          </motion.h1>
          <p className="text-sm text-gray-400 mb-6">
            Use the sidebar to navigate your dashboard.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default WelcomePage;
