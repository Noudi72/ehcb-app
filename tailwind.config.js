/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // Define custom colors for better dark mode support
        primary: {
          light: '#0a2240',
          dark: '#1e3a5f'
        },
        secondary: {
          light: '#f8fafc',
          dark: '#1f2937'
        }
      }
    },
  },
  plugins: [],
}