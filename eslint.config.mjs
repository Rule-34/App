import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: [
      '.nuxt/**',
      '.output/**',
      'coverage/**',
      'dist/**',
      'node_modules/**',
      'app/assets/lib/rule-34-shared-resources/**',
      'public/js/**'
    ]
  },
  {
    rules: {
      // Prettier owns Vue/HTML formatting, including void-element closing style.
      'vue/html-self-closing': 'off',

      // Vue 3 fragments are valid and used throughout the app.
      'vue/no-multiple-template-root': 'off'
    }
  }
)
