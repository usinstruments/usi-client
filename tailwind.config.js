/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/renderer/index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['B612', 'sans-serif'],
        'mono': ['B612 Mono', 'monospace']
      },
    },
  },
  plugins: [],
}

