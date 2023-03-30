<template>
	<figure class="material-container advertisement ad ads">
		<!-- -->

		<!-- Media -->
		<a
			:href="advertisement.link"
			rel="noopener nofollow"
			target="_blank"
		>
			<img
				:src="advertisement.media"
				alt="Advertisement"
			/>
		</a>

		<!-- Body -->
		<figcaption class="whitespace-normal px-1 py-1.5 text-center text-sm text-gray-300">
			Get
			<NuxtLink
				class="link"
				to="/premium"
				>Premium<!----></NuxtLink
			><!---->: No ads + exclusive features!
		</figcaption>
	</figure>
</template>

<script>
const ADVERTISEMENTS = [
	// Premium
	{
		media: '/img/advertisement/R34_App_Premium.jpg',
		link: '/premium'
	},
	// HentaiPorn
	{
		media: '/img/advertisement/HentaiPorn.jpg',
		link: 'https://hentaiporn.app/?utm_source=R34App&utm_medium=Advertisement'
	}
]

export default {
	name: 'Advertisement',

	data() {
		return {
			advertisement: null
		}
	},

	beforeMount() {
		this.advertisement = ADVERTISEMENTS[Math.floor(Math.random() * ADVERTISEMENTS.length)]
	}
}
</script>
