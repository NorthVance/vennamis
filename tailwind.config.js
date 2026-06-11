/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: { 
        sans: ['Plus Jakarta Sans', 'sans-serif'] 
      },
      animation: { 
        'cyber-pan': 'cyberPan 20s linear infinite', 
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite', 
        'kenburns': 'kenburns 20s ease-in-out infinite alternate' 
      },
      keyframes: {
        cyberPan: { 
          '0%': { backgroundPosition: '0% 0%' }, 
          '100%': { backgroundPosition: '100% 100%' } 
        },
        pulseGlow: { 
          '0%, 100%': { opacity: 0.4 }, 
          '50%': { opacity: 0.8 } 
        },
        kenburns: { 
          '0%': { transform: 'scale(1)' }, 
          '100%': { transform: 'scale(1.1)' } 
        }
      }
    }
  },
  plugins: [],
}
