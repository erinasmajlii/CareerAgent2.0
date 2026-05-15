/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        matrix: '#00FF41',
        warning: '#FFBF00',
        terminalBg: '#000000',
      },
      fontFamily: {
        mono: ['monospace'], // React Native default mapping for monospace
      }
    },
  },
  plugins: [],
}
