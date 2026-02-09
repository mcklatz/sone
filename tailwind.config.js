/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        tidal: {
          bg: "#121212", // Main background (almost black)
          sidebar: "#000000", // Sidebar background (pure black)
          highlight: "#00FFFF", // Tidal Cyan
          secondary: "#1A1A1A", // Card/Section background
          text: "#FFFFFF", // Primary text
          muted: "#A0A0A0", // Secondary text
        },
      },
    },
  },
  plugins: [],
};
