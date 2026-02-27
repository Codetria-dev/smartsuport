/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pastel: '#E8d4b9',
          light: '#e19e6a',
          DEFAULT: '#d64e38',
          dark: '#b83d2a',
          darker: '#6f6f4b',
        },
      },
    },
  },
  plugins: [],
}
