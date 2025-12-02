/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'], // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        'primary': '#AC6AFF', // Main purple from the landing page
        'secondary': '#FF776F', // Accent pink/orange
        'accent': '#7ADB78', // Accent green
        'background': 'var(--color-background)',
        'surface': 'var(--color-surface)',
        'panel': 'var(--color-panel)',
        'glass': 'var(--color-glass)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'border-color': 'var(--color-border)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // A clean, modern font
      },
      boxShadow: {
        'glow-primary': '0 0 15px 5px rgba(172, 106, 255, 0.2)',
        'glow-secondary': '0 0 15px 5px rgba(255, 119, 111, 0.2)',
      },
    },
  },
  plugins: [],
};

