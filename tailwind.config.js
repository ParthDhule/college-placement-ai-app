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
        cream: '#fdf0d5',
        navy: '#003049',
        blue: '#669bbc',
        red: '#c1121f',
        maroon: '#780000',
      },
    },
  },
  plugins: [],
}

