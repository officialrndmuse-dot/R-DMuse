/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Same brand palette as the storefront, for visual consistency
        plum:   "#3B1E38",
        berry:  "#5A2A4E",
        brass:  "#C79A4B",
        brassLite: "#E4C77E",
        ivory:  "#FBF6EC",
        blush:  "#E8B9B3",
        ink:    "#1A1416",
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(59,30,56,0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
