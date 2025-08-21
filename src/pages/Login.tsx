import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Login() {
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/welcome");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError("Invalid email or password.");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await googleLogin();
      navigate("/welcome");
    } catch (err: any) {
      console.error("Google login failed:", err);
      setError("Google login failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-[#1a1a1a] to-[#2b2b2b] text-white">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-[#1a1110]/95 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-[#242124]"
      >
        <h1 className="text-2xl font-semibold text-center mb-1 text-gray-300">
          Welcome Back
        </h1>
        <p className="text-sm text-center text-gray-500 mb-5">
          Log in to continue to your dashboard
        </p>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm mb-4 text-center"
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={handleEmailLogin} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="p-3 rounded-lg bg-[#242124] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#353839] transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 rounded-lg bg-[#242124] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#353839] transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 20px rgba(66, 133, 244, 0.6)",
            }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="bg-gradient-to-r from-[#242124] to-[#353839] text-white p-3 rounded-lg shadow-md transition"
          >
            Login
          </motion.button>
        </form>

        {/* Google Button */}
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow:
              "0 0 20px rgba(66,133,244,0.6), 0 0 40px rgba(219,68,55,0.5), 0 0 60px rgba(244,180,0,0.5), 0 0 80px rgba(15,157,88,0.5)",
          }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGoogleLogin}
          className="relative w-full mt-4 flex items-center justify-center gap-2 
                     p-3 rounded-lg shadow-md 
                     bg-gradient-to-r from-[#4285F4]/80 via-[#DB4437]/80 to-[#F4B400]/80 
                     hover:opacity-90 transition text-white font-medium"
        >
          <span className="bg-white rounded-full p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-5 h-5"
            >
              <path
                fill="#4285F4"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.62 2.58 30.24 0 24 0 14.65 0 6.61 5.36 2.57 13.11l7.98 6.2C12.35 13.03 17.74 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.5 24.5c0-1.63-.15-3.2-.43-4.71H24v9.02h12.65c-.55 2.88-2.18 5.32-4.63 6.96l7.2 5.59c4.21-3.89 6.28-9.61 6.28-16.86z"
              />
              <path
                fill="#FBBC05"
                d="M10.55 28.31c-.48-1.41-.75-2.91-.75-4.46s.27-3.05.75-4.46l-7.98-6.2C1.13 16.15 0 19.94 0 23.85s1.13 7.7 2.57 10.66l7.98-6.2z"
              />
              <path
                fill="#EA4335"
                d="M24 48c6.24 0 11.62-2.06 15.55-5.61l-7.2-5.59c-2.02 1.37-4.59 2.17-8.35 2.17-6.26 0-11.65-3.53-13.45-8.56l-7.98 6.2C6.61 42.64 14.65 48 24 48z"
              />
            </svg>
          </span>
          Continue with Google
        </motion.button>

        <p className="mt-6 text-sm text-gray-400 text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-[#808080] hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
