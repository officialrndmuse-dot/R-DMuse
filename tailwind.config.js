/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // RnD Muse palette — jewel-toned ethnic x modern
        plum:   "#3B1E38", // deep aubergine — primary brand ink
        berry:  "#5A2A4E", // lighter plum for hovers/surfaces
        brass:  "#C79A4B", // gold/brass accent (the jewellery cue)
        brassLite: "#E4C77E",
        ivory:  "#FBF6EC", // warm canvas
        blush:  "#E8B9B3", // soft secondary
        ink:    "#1A1416", // near-black text
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
