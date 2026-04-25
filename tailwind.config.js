/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
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
          50: "#f3f4fc",
          100: "#e4e6f6",
          200: "#c1c7ec",
          300: "#8c94d6",
          400: "#626fbe",
          500: "#37469e",
          600: "#2d398a",
          700: "#242e72",
          800: "#1c2459",
          900: "#0f1439",
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
        brand: {
          DEFAULT: "#37469e",
          dark: "#242e72",
          light: "#e4e6f6",
          blue: "#4555a7",
          purple: "#53406b",
          "deep-purple": "#3e234c",
          "mid-purple": "#6c3c85",
          cream: "#fef9f3",
        },
        cream: {
          DEFAULT: "#fef9f3",
          50: "#fffdf9",
          100: "#fef9f3",
          200: "#fbf1df",
          300: "#f6e6c7",
          400: "#ecd6a6",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(to right, #4555a7, #53406b)",
        "brand-gradient-vertical": "linear-gradient(to bottom, #4555a7, #53406b)",
        "brand-gradient-br": "linear-gradient(to bottom right, #4555a7, #53406b)",
        "brand-gradient-deep": "linear-gradient(to right, #3e234c, #6c3c85)",
        "brand-gradient-deep-br": "linear-gradient(to bottom right, #3e234c, #6c3c85)",
        "brand-gradient-soft":
          "linear-gradient(to bottom right, #fef9f3, #f3f4fc, #e4e6f6)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
