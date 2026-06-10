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
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981', // Emerald 500
          600: '#059669', // Emerald 600
          900: '#064e3b', // Emerald 900
        },
        dark: {
          950: '#09090b', // Zinc 950
          900: '#18181b', // Zinc 900
          800: '#27272a', // Zinc 800
          700: '#3f3f46', // Zinc 700
          600: '#52525b', // Zinc 600
        }
      },
    },
  },
  plugins: [],
}
