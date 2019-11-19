module.exports = {
  theme: {
    extend: {
      colors: {
        "black-10": "rgba(0, 0, 0, 0.1)",
        "black-15": "rgba(0, 0, 0, 0.15)",
        "black-80": "rgba(0, 0, 0, 0.8)",
        "black-90": "rgba(0, 0, 0, 0.9)",
        "white-10": "rgba(255, 255, 255, 0.1)"
      },

      inset: {},
      // Width and height
      spacing: {
        "percent-25": "25%",
        "fit-content": "fit-content"
      },

      maxHeight: {
        "0": "0px",
        "1/4": "25%",
        "1/2": "50%",
        "3/4": "75%"
      },

      minHeight: {
        "1/4": "25%",
        "1/2": "50%",
        "3/4": "75%"
      }
    }
  },
  // Recommended variant order
  // ['responsive', 'group-hover', 'focus-within', 'first', 'last', 'odd', 'even', 'hover', 'focus', 'active', 'visited', 'disabled']

  // Every variant possible
  // variants: ['responsive', 'group-hover', 'focus-within', 'first', 'last', 'odd', 'even', 'hover', 'focus', 'active', 'visited', 'disabled'],
  variants: {
    textColor: ["responsive", "group-hover", "hover", "focus"]
  }

  // plugins: [require('tailwindcss-gradients')()]
};
