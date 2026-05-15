/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        matrix: '#00FF41',
        neonred: '#FF3131',
        terminalBg: '#0D0D0D',
      },
      fontFamily: {
        mono: ['"Fira Code"', 'monospace'],
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
}
