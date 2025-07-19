/** @type {import('tailwindcss').Config} */
export default {
 darkMode: ["class"],
 content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
  "*.{js,ts,jsx,tsx,mdx}",
 ],
 theme: {
  extend: {
   fontFamily: {
    artifakt: ["Artifakt Element", "sans-serif"],
    sans: ["Artifakt Element", "ui-sans-serif", "system-ui", "sans-serif"],
   },
   fontWeight: {
    "artifakt-bold": "700",
   },
   colors: {
    border: "hsl(var(--border))",
    input: "hsl(var(--input))",
    ring: "hsl(var(--ring))",
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    primary: {
     DEFAULT: "hsl(var(--primary))",
     foreground: "hsl(var(--primary-foreground))",
    },
    secondary: {
     DEFAULT: "hsl(var(--secondary))",
     foreground: "hsl(var(--secondary-foreground))",
    },
    destructive: {
     DEFAULT: "hsl(var(--destructive))",
     foreground: "hsl(var(--destructive-foreground))",
    },
    muted: {
     DEFAULT: "hsl(var(--muted))",
     foreground: "hsl(var(--muted-foreground))",
    },
    accent: {
     DEFAULT: "hsl(var(--accent))",
     foreground: "hsl(var(--accent-foreground))",
    },
    popover: {
     DEFAULT: "hsl(var(--popover))",
     foreground: "hsl(var(--popover-foreground))",
    },
    card: {
     DEFAULT: "hsl(var(--card))",
     foreground: "hsl(var(--card-foreground))",
    },
    sidebar: {
     DEFAULT: "hsl(var(--sidebar-background))",
     foreground: "hsl(var(--sidebar-foreground))",
     primary: "hsl(var(--sidebar-primary))",
     "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
     accent: "hsl(var(--sidebar-accent))",
     "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
     border: "hsl(var(--sidebar-border))",
     ring: "hsl(var(--sidebar-ring))",
    },
    // Coolors Purple Palette
    purple: {
     50: "hsl(var(--purple-50))", // #BEAAD4
     100: "hsl(var(--purple-100))", // #B8A2D0
     200: "hsl(var(--purple-200))", // #B199CB
     300: "hsl(var(--purple-300))", // #A98FC6
     400: "hsl(var(--purple-400))", // #A084C0
     500: "hsl(var(--purple-500))", // #9678BA
     600: "hsl(var(--purple-600))", // #886DA9 - Primary
     700: "hsl(var(--purple-700))", // #7C639A
     800: "hsl(var(--purple-800))", // #715A8C
     900: "hsl(var(--purple-900))", // #67527F
    },
    // Direct hex color utilities
    coolors: {
     purple1: "#67527F",
     purple2: "#715A8C",
     purple3: "#7C639A",
     purple4: "#886DA9",
     purple5: "#9678BA",
     purple6: "#A084C0",
     purple7: "#A98FC6",
     purple8: "#B199CB",
     purple9: "#B8A2D0",
     purple10: "#BEAAD4",
    },
   },
   borderRadius: {
    lg: "var(--radius)",
    md: "calc(var(--radius) - 2px)",
    sm: "calc(var(--radius) - 4px)",
   },
   animation: {
    "fade-in": "fadeIn 0.5s ease-in-out",
    "slide-up": "slideUp 0.3s ease-out",
    "scale-in": "scaleIn 0.2s ease-out",
   },
   keyframes: {
    fadeIn: {
     "0%": { opacity: "0" },
     "100%": { opacity: "1" },
    },
    slideUp: {
     "0%": { transform: "translateY(10px)", opacity: "0" },
     "100%": { transform: "translateY(0)", opacity: "1" },
    },
    scaleIn: {
     "0%": { transform: "scale(0.95)", opacity: "0" },
     "100%": { transform: "scale(1)", opacity: "1" },
    },
   },
  },
 },
 plugins: [require("tailwindcss-animate")],
};
