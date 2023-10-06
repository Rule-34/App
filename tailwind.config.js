const defaultTheme = require('tailwindcss/defaultTheme')
const defaultColors = require('tailwindcss/colors')
const { tailwindcssOriginSafelist } = require('@headlessui-float/vue')

module.exports = {
	content: [
		'./components/**/*.{js,vue,ts}',
		'./layouts/**/*.vue',
		'./pages/**/*.vue',
		'./plugins/**/*.{js,ts}',
		// @see https://github.com/nuxt/nuxt/issues/13278#issuecomment-1397293398
		// './nuxt.config.{js,ts}',
		'error.vue',
		'./app.vue'
	],

	safelist: [...tailwindcssOriginSafelist],

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
					hover: defaultColors.white,

					highlight: defaultColors.gray[200],

					DEFAULT: defaultColors.gray[400]
				}
			},

			fontFamily: {
				sans: ['Inter var', ...defaultTheme.fontFamily.sans]
			}
		}
	},

	plugins: [require('@tailwindcss/forms'), require('@headlessui/tailwindcss')]
}
