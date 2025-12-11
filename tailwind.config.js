module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0D1117',
          surface: '#161B22',
          border: '#1E2630',
          text: { primary: '#E6EDF3', secondary: '#9BA5B1' },
          accent: '#3B82F6',
          danger: '#EF4444',
        },
      },
    },
  },
  plugins: [],
};
