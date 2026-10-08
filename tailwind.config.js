/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        card: "var(--card)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        line: "var(--line)",
        income: "var(--income)",
        expense: "var(--expense)",
        over: "var(--over)",
        accent: "var(--accent)",
        "on-accent": "var(--on-accent)",
      },
    },
  },
  plugins: [],
};
