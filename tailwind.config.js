/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: '#F8F9FA',
        card: '#FFFFFF',
        border: {
          DEFAULT: '#DEE2E6',
          light: '#E9ECEF',
          dark: '#CED4DA'
        },
        navy: {
          DEFAULT: '#1E3A5F',
          hover: '#162C48',
          light: '#EBF2FA',
          border: '#B8D1E5'
        },
        charcoal: {
          DEFAULT: '#1A1A1A',
          muted: '#6C757D',
          subtle: '#495057'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        sm: '4px'
      }
    },
  },
  plugins: [],
}
