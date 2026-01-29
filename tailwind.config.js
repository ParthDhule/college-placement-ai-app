/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#bae6fd',
        navy: '#0c4a6e',
        blue: '#7dd2fa',
        red: '#2b007a',
        maroon: '#10047a',
      },
    },
  },
  plugins: [],
}
  
