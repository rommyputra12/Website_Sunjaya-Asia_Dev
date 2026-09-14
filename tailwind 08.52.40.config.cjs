/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        obsidian: "#051e2b",
        ink: "#082636",
        surface: "#0c2e40",
        azure: {
          DEFAULT: "#051e2b",
          hi: "#0c2e40",
          lo: "#02121b",
        },
        bone: "#F3F3F1",
        cream: "#F5F3EE",
        ash: "#A0AFB9",
        smoke: "#647D8C",
        ink2: "#0C1922",
        copper: {
          DEFAULT: "#C86230",
          hi: "#E07B48",
          lo: "#8A421F",
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted-bg))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent-bg))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        serif: ['"Bricolage Grotesque"', '"Manrope"', '"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Manrope"', 'system-ui', 'sans-serif'],
        italic: ['"Fraunces"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'Menlo', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '2px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)', filter: 'blur(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
