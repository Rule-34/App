module.exports = {
  theme: {
    extend: {

      colors: {
        'black-10': 'rgba(0, 0, 0, 0.1)',
        'white-10': 'rgba(255, 255, 255, 0.1)',
      },

      inset: {
        'minus-1/4': '-25%',
        'minus-3/4': '-75%',
        'minus-100': '-100%',
      },

      spacing: {
        'percent-25': '25%',
      },

      // linearGradients: theme => ({
      //   colors: theme('colors'),
      // }),
      // radialGradients: theme => ({
      //   colors: theme('colors'),
      // }),
      // conicGradients: theme => ({
      //   colors: theme('colors'),
      // }),

    }
  },
  variants: {},
  // plugins: [require('tailwindcss-gradients')()]
};