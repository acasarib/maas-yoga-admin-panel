/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      colors: {
        purple: {
          950: '#820d82',
        },
        orange: {
          550: '#ea8215'
        }
      },
    },
  },
  plugins: [],
}