import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#05130f",
          900: "#081b15",
          850: "#0b241c",
          800: "#0f2e23",
          700: "#163a2c",
        },
        emerald: {
          400: "#34e0a1",
          500: "#1fc98a",
          600: "#12a873",
        },
        signal: {
          amber: "#f2b544",
          coral: "#ff6b5e",
          sky: "#57c8e8",
        },
        ink: {
          100: "#eef6f1",
          300: "#b9cdc2",
          500: "#7d9a8c",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "grid-glow": "radial-gradient(circle at 20% -10%, rgba(52,224,161,0.18), transparent 45%), radial-gradient(circle at 90% 10%, rgba(87,200,232,0.12), transparent 40%)",
      },
      keyframes: {
        rise: { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        pulseSlow: { "0%,100%": { opacity: "0.6" }, "50%": { opacity: "1" } },
      },
      animation: {
        rise: "rise 0.6s ease-out both",
        pulseSlow: "pulseSlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
