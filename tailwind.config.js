module.exports = {
  purge: [
  	"./src/**/*.tsx",
  	"./dist/**/*.html",
  ],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [
  	require('@tailwindcss/ui'),
  ],
};
