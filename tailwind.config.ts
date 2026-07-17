import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        ink: "var(--ink)",
        "ink-strong": "var(--ink-strong)",
        "ink-faded": "var(--ink-faded)",
      },
      fontFamily: {
        hand: "var(--font-hand)",
        garamond: "var(--font-garamond)",
      },
    },
  },
  plugins: [],
};

export default config;
