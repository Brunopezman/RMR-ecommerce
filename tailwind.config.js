import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.resolve(__dirname, 'index.html'),
    path.resolve(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        coral: 'rgb(245, 146, 109)',
        'coral-dark': 'rgb(191, 80, 40)',
      },
      fontFamily: {
        sans: ['Oswald', 'Roboto', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'system-ui', 'sans-serif'],
        garamond: ['EB Garamond', 'serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-up-delayed': 'slideUp 0.3s ease-out 0.1s',
        'bounce-scale': 'bounceScale 0.6s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceScale: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-6px) scale(1.1)' },
        },
      },
    },
  },
  plugins: [],
};
