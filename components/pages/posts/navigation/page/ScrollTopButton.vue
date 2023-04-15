<template>
	<transition name="page">
		<button
			v-if="visible"
			aria-label="Go to the top of the page"
			class="border-util focus-visible:focus-util fixed bottom-6 right-6 z-10 rounded-full bg-darkGray-500 p-3 shadow-xl"
			type="button"
			@click="scrollToTop"
		>
			<ArrowUpIcon class="icon h-6 w-6" />
		</button>
	</transition>
</template>

<script>
import { ArrowUpIcon } from 'vue-feather-icons'

export default {
	components: {
		ArrowUpIcon
	},

	data() {
		return {
			visible: false,
			previousY: 0
		}
	},

	mounted() {
		document.addEventListener('scroll', this.onScroll, { passive: true })
	},

	beforeDestroy() {
		document.removeEventListener('scroll', this.onScroll)
	},

	methods: {
		onScroll() {
			const currentY = window.scrollY

			this.visible =
				(currentY < this.previousY && currentY > 0) || window.innerHeight + currentY >= document.body.scrollHeight

			this.previousY = currentY
		},

		scrollToTop() {
			window.scrollTo(0, 0)
		}
	}
}
</script>
