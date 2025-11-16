/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': '#AC6AFF', // Main purple from the landing page
        'secondary': '#FF776F', // Accent pink/orange
        'accent': '#7ADB78', // Accent green
        'background': '#0E0B1A', // Deep dark purple background
        'surface': '#1A1A2E', // Slightly lighter surface color
        'panel': '#161326', // A bit lighter for panels and cards
        'glass': 'rgba(22, 19, 38, 0.6)', // For glassmorphism effect
        'text-primary': '#E0DDFE', // Light lavender text
        'text-secondary': '#9B99B9', // Muted lavender/gray text
        'border-color': 'rgba(172, 106, 255, 0.2)', // Translucent purple for borders
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

