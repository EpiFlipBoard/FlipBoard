export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E12828',
          dark: '#1A1A1A',
          light: '#F7F7F7',
        },
      },
      fontFamily: {
        sans: ['Inter','system-ui','-apple-system','Segoe UI','Roboto','Ubuntu','Cantarell','Noto Sans','Helvetica Neue','Arial','sans-serif'],
      },
      boxShadow: {
        magazine: '0 10px 25px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}