/** @type {import('prettier').Config} */
export default {
  printWidth: 120,
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  vueIndentScriptAndStyle: true,
  singleAttributePerLine: true,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindStylesheet: './app/assets/css/main.css'
}
