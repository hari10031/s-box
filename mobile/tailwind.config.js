/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B1A4A',
          light: '#B5385A',
          dark: '#5C0E32',
        },
        secondary: {
          DEFAULT: '#C8956E',
          light: '#E8C9A0',
          dark: '#9B6B42',
        },
        accent: {
          DEFAULT: '#2D6A4F',
          light: '#52B788',
        },
        surface: {
          DEFAULT: '#1A1A2E',
          light: '#222244',
        },
        card: '#16213E',
        border: '#2A2A4A',
        pending: '#F4A233',
        approved: '#2DC653',
        rejected: '#E63946',
      },
      backgroundColor: {
        app: '#0D0D0D',
      },
    },
  },
  plugins: [],
};
