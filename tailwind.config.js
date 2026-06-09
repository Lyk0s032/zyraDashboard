/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        menuIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        iosPopIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        iosPopOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.97)' },
        },
        backdropIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        backdropOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'menu-in': 'menuIn 150ms ease-out',
        'ios-pop-in': 'iosPopIn 150ms ease-out',
        'ios-pop-out': 'iosPopOut 150ms ease-in forwards',
        'context-menu-in': 'iosPopIn 150ms ease-out',
        'context-menu-out': 'iosPopOut 150ms ease-in forwards',
        'backdrop-in': 'backdropIn 300ms ease-out',
        'backdrop-out': 'backdropOut 200ms ease-in forwards',
        'fade-in': 'fadeIn 200ms ease-out',
      },
    },
  },
  plugins: [],
}
