/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        deep: '#101820',
        elevated: '#182630',
        slate: '#344955',
        solar: '#FFD166',
        solardeep: '#E0A93E',
        alert: '#E5484D',
        ink: '#F1F4F6',
        mist: '#AAB6C2',
        haze: '#53636D',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-solar': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '0.3' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(220%)' },
        },
        'drift-dust': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(120px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'pulse-solar': 'pulse-solar 2.4s ease-in-out infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
        sweep: 'sweep 3.2s linear infinite',
        'drift-dust': 'drift-dust 7s linear infinite',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 32px -16px rgba(0,0,0,0.55)',
        solar: '0 8px 24px -8px rgba(255,209,102,0.45)',
      },
    },
  },
  plugins: [],
};
