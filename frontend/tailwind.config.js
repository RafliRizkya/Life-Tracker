/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Editorial palette — warm off-white/cream with sage/olive greens
        // and terracotta accents. Not "AI slop" purple/blue.
        paper: {
          DEFAULT: "#f5f2ea",
          soft: "#efeade",
          deep: "#e9e3d3",
        },
        card: {
          DEFAULT: "#fffdf8",
          soft: "#f9f5ea",
        },
        ink: {
          DEFAULT: "#1d2b24",
          soft: "#2b3d33",
          muted: "#718078",
        },
        forest: {
          50: "#eaf1ea",
          100: "#cfe0d3",
          200: "#a8c4ae",
          300: "#7ba888",
          400: "#4d8265",
          500: "#315d48",
          600: "#264c3a",
          700: "#1e3d2f",
          800: "#183024",
          900: "#0f2018",
        },
        sage: "#aab9a5",
        olive: "#8a9a5b",
        lime: {
          DEFAULT: "#d5eb7e",
          soft: "#e5f2ad",
          deep: "#a8c845",
        },
        terracotta: {
          DEFAULT: "#eb9b63",
          soft: "#f4c7a4",
          deep: "#c9743c",
        },
        cream: "#f5efe2",
        line: "#dddcd4",
        // Dark mode intentionally-designed palette
        night: {
          DEFAULT: "#0f1613",
          card: "#161f1a",
          soft: "#1b2620",
          border: "#243128",
          text: "#e6ebe1",
          muted: "#8a9a90",
        },
      },
      fontFamily: {
        // Playfair Display for editorial serif headings (elegant, distinctive)
        display: ["'Playfair Display'", "Georgia", "serif"],
        // Instrument Serif as alt for reflection
        reflect: ["'Instrument Serif'", "'Playfair Display'", "serif"],
        // DM Sans for clean, readable interface
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        // DM Mono for meta / eyebrows / numeric data
        mono: ["'DM Mono'", "ui-monospace", "monospace"],
      },
      fontSize: {
        eyebrow: ["10px", { lineHeight: "1.4", letterSpacing: "0.12em" }],
      },
      borderRadius: {
        xs: "6px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(29,43,36,0.04), 0 4px 24px -8px rgba(29,43,36,0.08)",
        pop: "0 24px 60px -20px rgba(29,43,36,0.35)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: 0, transform: "translateY(14px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        grow: {
          "0%": { width: "0%" },
          "100%": { width: "var(--target-width, 100%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        rise: "rise 0.55s ease-out both",
        grow: "grow 1s cubic-bezier(0.22,1,0.36,1) forwards",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};
