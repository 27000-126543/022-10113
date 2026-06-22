/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        rose: {
          50: "#FDF8F3",
          100: "#FAF0E6",
          200: "#F3DFC8",
          300: "#E8C4A0",
          400: "#D4A574",
          500: "#C08A5A",
          600: "#A67046",
          700: "#8A5A38",
          800: "#6E462D",
          900: "#553522",
        },
        mint: {
          50: "#F0F7F4",
          100: "#DCEAE4",
          200: "#B9D5CB",
          300: "#95BFB1",
          400: "#7FB7A6",
          500: "#5E9C89",
          600: "#4A8070",
          700: "#3A6558",
          800: "#2D4F45",
          900: "#223C35",
        },
        coral: {
          50: "#FDF3F0",
          100: "#FBE0D7",
          200: "#F5C1AE",
          300: "#ED9E83",
          400: "#E07A5F",
          500: "#CE5A3D",
          600: "#B0452B",
          700: "#913823",
          800: "#752D1D",
          900: "#5C2317",
        },
        cream: {
          50: "#FDFCFA",
          100: "#FAF8F5",
          200: "#F5F0E9",
          300: "#EEE5D9",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(192, 138, 90, 0.08)",
        "card-hover": "0 8px 24px rgba(192, 138, 90, 0.12)",
        rose: "0 4px 16px rgba(212, 165, 116, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "breathe": "breathe 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        breathe: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(224, 122, 95, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(224, 122, 95, 0)" },
        },
      },
      backgroundImage: {
        "rose-gradient": "linear-gradient(135deg, #D4A574 0%, #E8C4A0 100%)",
        "rose-gradient-soft": "linear-gradient(135deg, #F3DFC8 0%, #FAF0E6 100%)",
      },
    },
  },
  plugins: [],
};
