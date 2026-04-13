/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        netflix: {
          red: '#E50914',
          black: '#141414',
          gray: '#808080',
        }
      },
      backgroundImage: {
        'hero-pattern': "url('https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bca1-0758328f7a53/afbf303d-8208-4e89-9a2c-e3549f3e4e9a/BR-pt-20220502-popsignuptwoweeks-perspective_alpha_website_large.jpg')",
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}
