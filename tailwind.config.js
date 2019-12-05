module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',

        default: 'var(--color-default)',
        'default-text': 'var(--color-default-text)',
        'default-text-muted': 'var(--color-default-text-muted)',

        background: 'var(--color-background)',

        border: 'var(--color-border)',
        'border-hover': 'var(--color-border-hover)',

        'gradient-one': '--color-gradient-one',
        'gradient-two': '--color-gradient-two',

        'black-25': 'rgba(0, 0, 0, 0.25)',
      },

      inset: {},
      // Width and height
      spacing: {
        'percent-25': '25%',
        'fit-content': 'fit-content',
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
  },
  // Recommended variant order
  // ['responsive', 'group-hover', 'focus-within', 'first', 'last', 'odd', 'even', 'hover', 'focus', 'active', 'visited', 'disabled']

  // Every variant possible
  // variants: ['responsive', 'group-hover', 'focus-within', 'first', 'last', 'odd', 'even', 'hover', 'focus', 'active', 'visited', 'disabled'],
  variants: {
    textColor: ['responsive', 'group-hover', 'hover', 'focus'],
  },
}
