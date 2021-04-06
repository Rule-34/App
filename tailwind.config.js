const defaultTheme = require('tailwindcss/defaultTheme')

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
        // TODO: redo colors

        // Colors
        primary: 'hsl(205, 78%, 62%)',
        'primary-hover': 'hsl(209, 62%, 50%)',

        // accent: 'var(--color-accent)',
        // 'accent-hover': 'var(--color-accent-hover)',

        default: 'hsl(0, 0%, 100%)',
        'default-text': 'hsla(0, 0%, 100%, 0.9)',
        'default-text-muted': 'hsla(0, 0%, 100%, 0.7)',

        background: 'hsl(0, 0%, 7%)',

        elevation: 'hsl(209, 15%, 9%)',

        depth: 'hsl(209, 10%, 13%)',

        border: 'hsl(214, 32%, 25%)',
        'border-hover': 'var(--color-primary-hover)',

        'lilac-gra': 'hsl(240, 53%, 74%)',
        'blue-gra': 'hsl(190, 100%, 50%)',
      },

      // Top, left, etc.
      inset: {
        // '-14': '-3.5rem',
        // '-16': '-4rem',
      },

      // padding, margin, width, and height
      spacing: {
        // '7vw': '7vw',
        // '14vw': '14vw'
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
