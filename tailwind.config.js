/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      /* --------------------------------------
         ⚡ KEYFRAMES
      --------------------------------------- */
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        cyberWave: {
          "0%, 100%": { transform: "translateX(-30%) scaleX(0.9)" },
          "50%": { transform: "translateX(30%) scaleX(1.15)" },
        },
        scanBeam: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        pulseBars: {
          "0%": { height: "15%" },
          "50%": { height: "85%" },
          "100%": { height: "25%" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: 0.4 },
          "50%": { opacity: 1 },
        }
      },

      /* --------------------------------------
         ⚡ ANIMATIONS
      --------------------------------------- */
      animation: {
        shimmer: "shimmer 1.8s linear infinite",
        cyberWave: "cyberWave 2s ease-in-out infinite",
        scanBeam: "scanBeam 1.8s ease-in-out infinite",
        pulseBars: "pulseBars 1.2s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },

      /* --------------------------------------
         🎨 NEW COLOR THEME: LIGHT ORANGE + YELLOW
      --------------------------------------- */
      colors: {
        "ztna-light-orange": "#FFB877",   // soft warm orange
        "ztna-soft-yellow": "#FFE499",    // pastel yellow
        "ztna-orange-bright": "#FF9F45",  // smooth bright orange
        "ztna-orange-glow": "#FF7A1A",    // deeper glow
        "ztna-yellow-glow": "#FFD466",    // warm golden glow
      },

      /* --------------------------------------
         🌟 GLOW SHADOWS (Orange/Yellow)
      --------------------------------------- */
      boxShadow: {
        "glow-orange": "0 0 25px rgba(255, 147, 41, 0.45)",
        "glow-yellow": "0 0 25px rgba(255, 212, 102, 0.45)",
      },
    },
  },

  plugins: [],
};
