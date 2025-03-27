
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
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
        arcade: {
          dark: "#121212",
          accent: "#FF3E3E",
          neon: "#39FF14",
          blue: "#4DA6FF",
          purple: "#9D4EDD",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-3px, 3px)" },
          "40%": { transform: "translate(-3px, -3px)" },
          "60%": { transform: "translate(3px, 3px)" },
          "80%": { transform: "translate(3px, -3px)" },
          "100%": { transform: "translate(0)" },
        },
        "glitch-accent": {
          "0%": {
            textShadow: "0.05em 0 0 #FF3E3E, -0.05em -0.025em 0 #4DA6FF",
            transform: "translate(0)",
          },
          "20%": {
            textShadow: "-0.05em -0.025em 0 #FF3E3E, 0.025em 0.025em 0 #4DA6FF",
            transform: "translate(-3px, 3px)",
          },
          "40%": {
            textShadow: "-0.05em -0.025em 0 #FF3E3E, 0.025em 0.025em 0 #4DA6FF",
            transform: "translate(-3px, -3px)",
          },
          "60%": {
            textShadow: "0.05em 0.05em 0 #FF3E3E, 0 -0.05em 0 #4DA6FF",
            transform: "translate(3px, 3px)",
          },
          "80%": {
            textShadow: "-0.05em 0 0 #FF3E3E, 0 -0.05em 0 #4DA6FF",
            transform: "translate(3px, -3px)",
          },
          "100%": {
            textShadow: "0.05em 0 0 #FF3E3E, -0.05em -0.025em 0 #4DA6FF",
            transform: "translate(0)",
          },
        },
        scanline: {
          "0%": { transform: "translateY(0%)" },
          "100%": { transform: "translateY(100%)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "pixel-slide-in": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pixel-slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-out": "fade-out 0.5s ease-out forwards",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        glitch: "glitch 0.5s cubic-bezier(.25,.46,.45,.94) both infinite",
        "glitch-accent": "glitch-accent 0.8s cubic-bezier(.25,.46,.45,.94) both infinite",
        scanline: "scanline 8s linear infinite",
        blink: "blink 1s step-end infinite",
        "pixel-slide-in": "pixel-slide-in 0.8s cubic-bezier(.25,.46,.45,.94) forwards",
        "pixel-slide-up": "pixel-slide-up 0.5s cubic-bezier(.25,.46,.45,.94) forwards",
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        arcade: ['"Arcade"', 'monospace'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
