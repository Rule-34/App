import { mapActions } from 'vuex'
import { debounce } from 'lodash-es'

export default {
	async fetch() {
		await this.debouncedFetchPosts('set')
	},

	// Fetch option
	fetchOnServer: false,

	watch: {
		'$route.query': function (val, oldVal) {
			let shouldSetPosts = false

			// Set posts if an important part of the query changed, like domain and tags
			if (val.domain !== oldVal.domain) {
				shouldSetPosts = true
			}

			if (val.tags !== oldVal.tags) {
				shouldSetPosts = true
			}

			const fetchMode = shouldSetPosts ? 'set' : 'concat'

			this.debouncedFetchPosts(fetchMode)
		}
	},

	methods: {
		...mapActions('booru', ['fetchPosts']),

		debouncedFetchPosts: debounce(
			async function (mode) {
				//

				await this.fetchPosts(mode)
			},
			1,
			{ maxWait: 5 }
		)
	}
}
