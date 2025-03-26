/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Default font
        serif: ['Georgia', 'serif'],
        mono: ['Courier New', 'monospace'],
        custom: ['Ubuntu', 'sans-serif'], 
      },
    },
  },
  plugins: [],
}