// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    extend: {
      colors: {
        // Colors
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',

        // accent: 'var(--color-accent)',
        // 'accent-hover': 'var(--color-accent-hover)',

        default: 'var(--color-default)',
        'default-text': 'var(--color-default-text)',
        'default-text-muted': 'var(--color-default-text-muted)',

        background: 'var(--color-background)',

        elevation: 'var(--color-elevation)',

        depth: 'var(--color-depth)',

        border: 'var(--color-border)',
        'border-hover': 'var(--color-border-hover)',

        'gradient-one': 'var(--color-gradient-one)',
        'gradient-two': 'var(--color-gradient-two)',

        // Extra
        'black-25': 'hsla(0, 0%, 0%, 0.25)',
      },

      // Top, left, etc.
      inset: {
        '-14': '-3.5rem',
        '-16': '-4rem',
      },

      // Width and height
      spacing: {
        'fit-content': 'fit-content',
        'max-content': 'max-content',
        'min-content': 'min-content',
        // Margins for content
        // '7vw': '7vw',
        // '14vw': '14vw'
      },

      maxHeight: {
        '0': '0px',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
      },

      minHeight: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
      },
    },
    fontFamily: {
      sans: ['Inter var', ...defaultTheme.fontFamily.sans],
    },
  },
  // Recommended variant order
  // ['responsive', 'group-hover', 'focus-within', 'first', 'last', 'odd', 'even', 'hover', 'focus', 'active', 'visited', 'disabled']

  // Every variant possible
  // variants: ['responsive', 'group-hover', 'focus-within', 'first', 'last', 'odd', 'even', 'hover', 'focus', 'active', 'visited', 'disabled'],
  variants: {
    textColor: ['responsive', 'group-hover', 'hover', 'focus'],
  },

  plugins: [
    require('@tailwindcss/ui')({
      layout: 'sidebar',
    }),
  ],
}
