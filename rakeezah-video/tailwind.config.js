/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rakeezah brand palette
        wood: {
          dark: '#6B5B4D',
          light: '#9D8B7C',
        },
        green: {
          dark: '#16A34A',
          light: '#22C55E',
        },
        gold: {
          dark: '#D97706',
          light: '#F59E0B',
        },
        dark: '#0F172A',
        bg: '#FAFAFA',
      },
      fontFamily: {
        'cairo': ['Cairo', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        bold: '700',
        black: '900',
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'gradient': 'gradient 15s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}