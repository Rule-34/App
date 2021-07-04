module.exports = {
  root: true,

  env: {
    browser: true,
    node: true,
  },

  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
  },

  extends: [
    // ESLint
    'eslint:recommended',

    // Nuxt & Vue
    '@nuxtjs',

    // Prettier
    'plugin:prettier/recommended',
  ],
}
