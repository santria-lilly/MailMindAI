/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF7',
          100: '#FBF9F4',
          200: '#F5EFE6',
          300: '#E9E2D8',
          400: '#DACFC1',
        },
        sage: {
          50: '#F3F6F4',
          100: '#E4ECE7',
          200: '#C8DAD0',
          300: '#A4C1B1',
          400: '#759F8C',
          500: '#52796F',
          600: '#406259',
          700: '#354F52',
          800: '#283E40',
          900: '#1D2E30',
        },
        charcoal: {
          50: '#F7F8F9',
          100: '#EDEFF2',
          200: '#DDE1E6',
          300: '#BAC2CC',
          400: '#8A95A5',
          500: '#5F6C7D',
          600: '#434E5D',
          700: '#2D3748',
          800: '#1F2633',
          900: '#121721',
        },
        priority: {
          critical: '#BE123C',
          criticalBg: '#FFF1F2',
          criticalBorder: '#FECDD3',
          high: '#C2410C',
          highBg: '#FFF7ED',
          highBorder: '#FFEDD5',
          medium: '#3E6B7A',
          mediumBg: '#F0F7F9',
          mediumBorder: '#D2E5EC',
          low: '#64748B',
          lowBg: '#F8FAFC',
          lowBorder: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(45, 55, 72, 0.04), 0 1px 2px rgba(45, 55, 72, 0.02)',
        'card': '0 4px 16px -2px rgba(45, 55, 72, 0.05), 0 2px 4px -2px rgba(45, 55, 72, 0.03)',
        'elevated': '0 12px 28px -4px rgba(45, 55, 72, 0.08), 0 4px 12px -2px rgba(45, 55, 72, 0.04)',
      }
    },
  },
  plugins: [],
}
