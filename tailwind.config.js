const defaultTheme = require('tailwindcss/defaultTheme')
const defaultColors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',

  purge: {
    options: {
      safelist: [/active/, /fade/, /enter/, /leave/],
    },
  },

  theme: {
    extend: {
      colors: {
        primary: defaultColors.cyan,

        accent: defaultColors.violet,

        // --- Default colors for text --- \\
        // Icons: black or white
        // Text: text-gray-200 | text-gray-800
        // Muted: text-gray-300 | text-gray-700

        darkGray: {
          100: ' hsl(209, 15%, 20%)', // Borders

          300: ' hsl(209, 15%, 9%)', // Elevation

          500: 'hsl(209, 10%, 13%)',

          700: 'hsl(0, 0%, 7%)', // Background
        },

        ...defaultColors,
      },

      maxHeight: {
        0: '0px',
        '1/4': '25%',
        '2/5': '40%',
        '1/2': '50%',
        '3/4': '75%',
      },

      minHeight: {
        0: '0px',
        '1/4': '25%',
        '2/5': '40%',
        '1/2': '50%',
        '3/4': '75%',
      },

      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },

  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
