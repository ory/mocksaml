/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'oklch(62% 0.21 258)',
        'primary-hover': 'oklch(58% 0.22 258)',
      },
    },
  },
  plugins: [],
};
