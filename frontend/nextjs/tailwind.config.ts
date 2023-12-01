import type { Config } from 'tailwindcss'
/** @type {import('tailwindcss').Config} */

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      boxShadow: {
        'shadow-custom': '0 4.4px 11.8px 0 hsla(245, 100%, 61%, 0.19)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'pink-gradient': 'linear-gradient(96deg, hsl(var(--accent-3)) 0%, hsl(var(--accent-4)) 137%)',
        'reverse-pink-gradient': 'linear-gradient(96deg, hsl(var(--accent-4)) 0%, hsl(var(--accent-3)) 137%)',
        'glass': 'linear-gradient(324deg, #182441 0%, rgba(24, 36, 65, 0.00) 101.76%)',
      },
      colors: {
        border: "hsl(var(--stroke) / 0.1)",
        'alt-stroke': "hsl(var(--stroke) / 0.05)",
        input: "hsl(var(--accent-shade))",
        ring: "hsl(var(--stroke) / 0.1)",
        background: "hsl(var(--accent-1))",
        foreground: "hsl(var(--text))",
        'alt': "hsl(var(--text-alt))",
        'muted': "hsl(var(--text-muted))",
        'accent-shade': 'hsl(var(--accent-shade))',
        'accent-1': 'hsl(var(--accent-1))',
        'accent-2': 'hsl(var(--accent-2))',
        'accent-3': 'hsl(var(--accent-3))',
        'accent-4': 'hsl(var(--accent-4))',
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
