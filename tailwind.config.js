/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        yellow: { 500: '#EAB308', 400: '#FACC15' },
        neutral: { 900: '#171717', 800: '#262626', 700: '#404040', 600: '#525252' }
      }
    },
  },
  plugins: [],
}