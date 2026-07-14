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
        'coral-dark': 'rgb(220, 120, 80)',
      },
      fontFamily: {
        sans: ['Oswald', 'Roboto', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'system-ui', 'sans-serif'],
        garamond: ['EB Garamond', 'serif'],
      },
    },
  },
  plugins: [],
};
