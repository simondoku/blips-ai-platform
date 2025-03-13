// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base colors
        blips: {
          black: "#121218",
          dark: "#1A1A25",
          card: "#242435",
          cardHover: "#262636",
          purple: {
            light: "#8884FF",
            DEFAULT: "#6C63FF",
            dark: "#5851DB",
          },
          text: {
            primary: "#FFFFFF",
            secondary: "#777790",
          }
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Montserrat', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(108, 99, 255, 0.5)',
      },
    },
  },
  plugins: [],
}