// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00796B", // Teal - Brand Primary
          light: "#4DB6AC", // Light Teal
          dark: "#004D40", // Dark Teal
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6", // Keeping existing blue as backup or secondary usage if needed
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        secondary: {
          DEFAULT: "#C9A227", // Gold - Brand Accent
          light: "#E0C068",
          dark: "#B89600", // Darker gold estimate
        },
        accent: {
          DEFAULT: "#4DB6AC",
          glow: "rgba(0, 121, 107, 0.3)",
        },
        neutral: {
          DEFAULT: "#4A5568",
          light: "#A0AEC0",
          dark: "#1A202C",
        },
      },
      fontFamily: {
        sans: ["Montserrat", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
      backgroundSize: {
        "size-200": "200% 200%",
      },
      animation: {
        "bg-pos-x": "bg-pos-x 3s ease infinite",
        shimmer: "shimmer 1.5s infinite ease-in-out",
      },
      keyframes: {
        "bg-pos-x": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
