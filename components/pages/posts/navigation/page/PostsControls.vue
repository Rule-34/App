<template>
	<div
		v-intersect="{
			handler: InfiniteLoadHandler,
			options: {
				rootMargin: '600px'
			}
		}"
		class="mx-auto py-12"
		@click="InfiniteLoadHandler"
	>
		<p class="animate-pulse text-center text-gray-300">Loading more posts...</p>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'

// Third party
import { Intersect } from 'vuetify/lib/directives/intersect'

// Components
import KeyboardNavigationMixin from '~/components/pages/posts/navigation/page/KeyboardNavigationMixin.js'

export default {
	directives: {
		Intersect
	},

	mixins: [KeyboardNavigationMixin],

	props: {
		currentPage: {
			type: Number,
			required: true
		},

		minimumPage: {
			type: Number,
			required: true
		}
	},

	computed: {
		...mapGetters('user', ['getUserSettings']),
		...mapGetters('booru', ['getPosts'])
	},

	methods: {
		getNextPage() {
			this.setPage(this.currentPage + 1)
		},

		getPrevPage() {
			this.setPage(this.currentPage - 1)
		},

		isBelowMinimumPage(page) {
			return page < this.minimumPage
		},

		setPage(page) {
			if (this.isBelowMinimumPage(page)) {
				return
			}

			this.$emit('setPage', page)
		},

		InfiniteLoadHandler(entries, observer) {
			if (!entries || !entries.length) {
				return
			}

			entries.forEach(async (entry) => {
				if (!entry.isIntersecting) {
					return
				}

				await this.getNextPage()
			})
		}
	}
}
</script>
