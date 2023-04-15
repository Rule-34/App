<template>
	<main class="mx-auto flex min-h-screen max-w-3xl flex-col p-4 sm:p-6 lg:p-8">
		<portal to="side-nav-area">
			<SearchToggler :tag-count="searchActiveTags.length" />
		</portal>

		<portal to="search">
			<SearchWrapper>
				<Search
					:initial-active-tags="searchActiveTags"
					:search-results="searchResults"
					@search="onSearch"
					@reset-search-results="resetSearchResults"
					@submit-active-tags="onSubmitActiveTags"
				/>
			</SearchWrapper>
		</portal>

		<portal to="body">
			<ScrollTopButton />
		</portal>

		<ContentSeparator title="Saved posts" />

		<nav class="flex flex-row items-center justify-between py-4">
			<DomainSelector
				:active-domain="selectedBooru"
				:domain-group-list="boorusThatHaveSavedPosts"
				@domainChange="onDomainChange"
			/>
		</nav>

		<ul class="space-y-4 pb-4">
			<template v-if="posts.length">
				<li
					v-for="POST in posts"
					:key="POST.id"
				>
					<Post
						:event-only="true"
						:post="POST"
						@tag-selected="onPostTagSelected"
					/>
				</li>
			</template>

			<template v-else>
				<li class="my-3 text-center text-gray-300">There are no saved posts. Go save some!</li>
			</template>
		</ul>

		<PostsControls
			v-if="posts.length"
			:current-page="currentPage"
			:minimum-page="0"
			@setPage="onPageChange"
		/>
	</main>
</template>

<script>
import { mapGetters } from 'vuex'
import { cloneDeep } from 'lodash-es'

function paginateArray(array, pageSize, pageNumber) {
	return array.slice(pageNumber * pageSize, pageNumber * pageSize + pageSize)
}

export default {
	data() {
		return {
			selectedBooru: '<All Boorus>',

			currentPage: 0,

			posts: [],

			searchResults: [],
			searchActiveTags: []
		}
	},

	head() {
		return {
			title: 'Saved posts',
			meta: [
				{
					hid: 'description',
					name: 'description',
					content: 'Save posts for later.'
				}
			]
		}
	},

	created() {
		this.setNextPosts()
	},

	computed: {
		...mapGetters('user', ['getCustomSavedPosts', 'getUserSettings']),

		boorusThatHaveSavedPosts() {
			const BOORU_DOMAIN_LIST = this.getCustomSavedPosts.map((POST) => POST.meta_data.booru_domain)

			const UNIQUE_SORTED_BOORU_DOMAIN_LIST = [...new Set(BOORU_DOMAIN_LIST)].sort()

			const BOORU_GROUP = {
				name: 'Default',
				domains: ['<All Boorus>', ...UNIQUE_SORTED_BOORU_DOMAIN_LIST]
			}

			return [BOORU_GROUP]
		},

		getSavedPostsFromSelectedBooru() {
			if (this.selectedBooru === '<All Boorus>') {
				return cloneDeep(this.getCustomSavedPosts)
			}

			return this.getCustomSavedPosts.filter((POST) => POST.meta_data.booru_domain === this.selectedBooru)
		}
	},

	methods: {
		mergeNextPosts() {
			// Merge and remove duplicates using the `id` property
			const posts = []
			const keys = new Set()

			for (const post of [...this.posts, ...this.getFilteredSavedPostsFromSelectedBooru()]) {
				if (!keys.has(post.id)) {
					keys.add(post.id)
					posts.push(post)
				}
			}

			this.posts = posts
		},

		setNextPosts() {
			this.posts = this.getFilteredSavedPostsFromSelectedBooru()
		},

		getFilteredSavedPostsFromSelectedBooru() {
			let savedPosts = this.getSavedPostsFromSelectedBooru

			savedPosts = this.filterPostsBySearchActiveTags(savedPosts)

			savedPosts = this.sortPostsByDate(savedPosts)

			savedPosts = this.paginatePosts(savedPosts)

			return savedPosts
		},

		sortPostsByDate(posts) {
			return posts.sort((postA, postB) => {
				const postADateString = postA.meta_data.created_at
				const postBDateString = postB.meta_data.created_at

				return new Date(postBDateString) - new Date(postADateString)
			})
		},

		filterPostsBySearchActiveTags(posts) {
			if (this.searchActiveTags.length === 0) {
				return posts
			}

			return posts.filter((post) => {
				const postTagsAsFlatArray = [...new Set(Object.values(post.data.tags).flat())]

				return this.searchActiveTags.every((tag) => postTagsAsFlatArray.includes(tag))
			})
		},

		paginatePosts(posts) {
			const postsPerPage = this.getUserSettings.postsPerPage.value

			const currentPage = this.currentPage

			return paginateArray(posts, postsPerPage, currentPage)
		},

		resetSearchResults() {
			this.searchResults = []
		},

		resetActiveTags() {
			this.searchActiveTags = []
		},

		resetCurrentPage() {
			this.currentPage = 0

			// TODO: Scroll to top until we have page queries
			this.scrollToTop()
		},

		resetPosts() {
			this.posts = []
		},

		onDomainChange(domain) {
			this.selectedBooru = domain

			this.resetPosts()

			this.resetCurrentPage()

			this.resetSearchResults()
			this.resetActiveTags()

			this.setNextPosts()
		},

		onPageChange(page) {
			this.currentPage = page

			if (page === 0) {
				this.scrollToTop()
			}

			this.mergeNextPosts()
		},

		onPostTagSelected(tag) {
			this.onSubmitActiveTags([tag])
		},

		onSearch(query) {
			const uniqueTagsFromSavedPosts = [
				...new Set(
					this.getSavedPostsFromSelectedBooru
						.map((post) => {
							let postTags = []

							// Loop for every Tag array
							Object.keys(post.data.tags).forEach((key) => {
								const tags = post.data.tags[key]

								postTags = [...postTags, ...tags]
							})

							return postTags
						})
						.flat()
				)
			]

			const availableTags = uniqueTagsFromSavedPosts.map((tag) => {
				return {
					id: tag,
					name: tag,
					count: null
				}
			})

			// Normalize query
			query = query.toLowerCase()

			const searchResults = availableTags.filter((tag) => {
				const normalizedTag = tag.name.toLowerCase()

				return normalizedTag.includes(query)
			})

			this.searchResults = searchResults
		},

		onSubmitActiveTags(tags) {
			this.searchActiveTags = tags

			this.resetCurrentPage()

			this.setNextPosts()
		},

		scrollToTop() {
			// TODO: Scroll to top until we have page queries
			window.scrollTo(0, 0)
		}
	}
}
</script>
