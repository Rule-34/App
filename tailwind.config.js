const defaultTheme = require('tailwindcss/defaultTheme')
const defaultColors = require('tailwindcss/colors')

module.exports = {
	content: [
		'./components/**/*.{js,vue,ts}',
		'./layouts/**/*.vue',
		'./pages/**/*.vue',
		'./plugins/**/*.{js,ts}',
		'./nuxt.config.{js,ts}',
		'./app.vue'
	],

	theme: {
		extend: {
			colors: {
				primary: defaultColors.sky,

				accent: defaultColors.violet,

				/**
				 * Used for the background
				 */
				base: {
					// TODO: remember that borders, and backgrounds use 20% opacity: border-base-0/20
					// TODO: E.g: border-base-0/20 & bg-base-0/20
					// TODO: Maybe create a specific attribute?
					0: defaultColors.white,

					...defaultColors.gray,

					1000: defaultColors.black
				},

				/**
				 * Used for text and icons on the background
				 */
				'base-content': {
					highlight: defaultColors.gray[200],

					DEFAULT: defaultColors.gray[400],

					hover: defaultColors.white
				}
			},

			fontFamily: {
				sans: ['Inter var', ...defaultTheme.fontFamily.sans]
			}
		}
	},

	plugins: [
		require('@tailwindcss/forms')({
			strategy: 'class'
		}),

		require('@headlessui/tailwindcss')
	]
}
