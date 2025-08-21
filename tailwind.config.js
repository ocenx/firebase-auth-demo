/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 👈 scans all src files
  ],
  theme: {
    extend: {
      colors: {
        background: "#121212", // main app background
        card: "#1e1e1e",       // default card bg
        cardHover: "#2a2a2a",  // hover state for cards
        cardMuted: "#1a1a1a",  // darker variant (unread highlight bg)
        borderMuted: "#383838" // subtle border
      },
      keyframes: {
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(239, 68, 68, 0.8)" }, // softer red glow
          "50%": { boxShadow: "0 0 20px rgba(239, 68, 68, 1)" }, // stronger glow
        },
      },
      animation: {
        "slide-in": "slide-in 0.4s ease-out forwards",
        glow: "glow 1.5s infinite ease-in-out", // 👈 new glow animation
      },
    },
  },
  plugins: [],
};
