// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  target: 'modern',

  purge: {
    content: [
      // 'assets/**/*.css',
      // 'assets/**/*.js',
      'components/**/*.vue',
      'layouts/**/*.vue',
      'pages/**/*.vue',
      'plugins/**/*.js',
      'nuxt.config.js',
    ],

    options: {
      whitelistPatterns: [/active/, /fade/, /enter/, /leave/],
    },
  },

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

      width: {
        'max-content': 'max-content',
        'min-content': 'min-content',
      },

      maxHeight: {
        '0': '0px',
        '1/4': '25%',
        '2/5': '40%',
        '1/2': '50%',
        '3/4': '75%',
      },

      minHeight: {
        '0': '0px',
        '1/4': '25%',
        '2/5': '40%',
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
