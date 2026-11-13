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
          navy: '#0f172a',
          navyLight: '#1e293b',
          navyDark: '#0a0f1d',
          accent: '#3b82f6',
          accentHover: '#2563eb',
          purple: '#7c3aed',
          bgLight: '#f8fafc',
          cardBorder: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        card: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
        hover: '0 20px 30px -10px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
}
