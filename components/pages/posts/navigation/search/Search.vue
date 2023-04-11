<template>
	<aside
		class="fixed z-20 h-full w-full bg-black bg-opacity-75"
		@click.self.stop="toggleSearchMenu"
	>
		<!-- Constraint -->
		<div
			class="mx-auto h-full max-w-3xl px-4 sm:px-6 lg:px-8"
			@click.self.stop="toggleSearchMenu"
		>
			<!-- Center content -->
			<div
				class="flex h-full flex-col items-center justify-center"
				@click.self.stop="toggleSearchMenu"
			>
				<!-- Content -->
				<form
					class="flex h-full max-h-3/4 w-full flex-col space-y-4"
					@submit.prevent="emitSubmitActiveTags"
				>
					<!-- Search bar -->
					<div class="material-container focus-within:focus-util flex h-auto flex-row p-2">
						<!-- Search Icon -->
						<SearchIcon class="icon h-6 w-6" />

						<!-- Input form -->
						<!-- Overflow Hidden is very important -->
						<!-- Input because v-model/:value doesn't work on mobile -->
						<input
							:value="search.query"
							aria-label="Search for tags"
							autocapitalize="none"
							autofocus
							class="mx-2 flex-1 overflow-hidden bg-darkGray-300 font-light text-gray-200 outline-none"
							name="search-tags"
							placeholder="Search: e.g. mario"
							type="search"
							@input="onSearchInput"
							@keypress.enter.prevent="onSearchEnter"
						/>

						<div class="flex space-x-1">
							<!-- Tag collections -->
							<button
								aria-label="Toggle Custom Tag Collections"
								title="Custom Tag Collections"
								type="button"
								@click="toggleTagCollections"
							>
								<TagIcon class="icon h-6 w-6 transition-colors duration-300 hover:text-gray-300" />
							</button>

							<button
								aria-label="Reset active tags"
								title="Reset active tags"
								type="button"
								@click="resetActiveTags"
							>
								<TrashIcon class="icon h-6 w-6 transition-colors duration-300 hover:text-gray-300" />
							</button>

							<!-- Negative -->
							<button
								aria-label="Filter out content"
								title="Filter out content"
								type="button"
								@click="toggleBanMode"
							>
								<FilterIcon
									:class="{
										'text-red-500 hover:text-red-400': isBanModeEnabled
									}"
									class="icon h-6 w-6 transition-colors duration-300 hover:text-gray-300"
								/>
							</button>
						</div>
					</div>

					<!-- Search results -->
					<div class="material-container relative flex h-full flex-col space-y-2 bg-darkGray-700 p-2">
						<!-- If nothing searched -->
						<template v-if="!searchResults.length && !search.activeTags.length">
							<h1 class="flex flex-auto items-center justify-center text-xl font-light tracking-wide text-gray-200">
								Search something!
							</h1>
						</template>

						<template v-else>
							<!-- Active tags, click them to remove them -->
							<template v-if="search.activeTags.length">
								<div class="tag-container flex-initial overflow-y-scroll rounded border-0 border-darkGray-100">
									<button
										v-for="tag in search.activeTags"
										:key="tag"
										class="tag link nuxt-link-exact-active"
										type="button"
										@click="removeFromActiveTags(tag)"
									>
										{{ tag }}
									</button>
								</div>
							</template>

							<!-- Searched tags, click them to add them -->
							<template v-if="searchResults.length">
								<div class="tag-container flex-auto overflow-y-scroll rounded border-0">
									<!-- Add tag to array of added tags -->
									<button
										v-for="tag in searchResults"
										:key="tag.id"
										class="tag link group"
										type="button"
										@click="addToActiveTagConsideringBanMode(tag.name)"
									>
										<!-- Name of the tag -->
										<span>
											{{ tag.name }}
										</span>

										<!-- Number of posts with that tag -->
										<span
											v-if="tag.count"
											class="text-gray-400 transition-colors duration-300 group-hover:text-primary-600"
											>{{ `(${tag.count})` }}
										</span>
									</button>
								</div>
							</template>
						</template>

						<!-- Submit -->
						<div class="absolute inset-x-0 bottom-0 flex">
							<button
								class="focus-visible:focus-util w-full bg-gradient-to-r from-accent-400 to-primary-400 px-4 py-2 text-center text-lg font-medium tracking-wide text-black ring-inset focus-visible:ring-white"
								type="submit"
							>
								Apply tags
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>

		<transition name="page">
			<SearchTagCollections
				v-if="tagCollections.isActive"
				:search-tags="search.activeTags"
				@mergeToSearchTags="mergeWithActiveTags"
				@toggleTagCollections="toggleTagCollections"
			/>
		</transition>
	</aside>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { FilterIcon, SearchIcon, TagIcon, TrashIcon } from 'vue-feather-icons'
import { debounce } from 'lodash-es'

export default {
	components: {
		TagIcon,
		SearchIcon,
		FilterIcon,
		TrashIcon
	},

	props: {
		initialActiveTags: {
			type: Array,
			default: () => []
		},
		searchResults: {
			type: Array,
			default: () => []
		}
	},

	data() {
		return {
			search: {
				query: '',

				activeTags: []
			},

			isBanModeEnabled: false,

			tagCollections: { isActive: false }
		}
	},

	computed: {
		...mapGetters('premium', ['isUserPremium']),

		// Workaround so we can use cancel on debounce
		// See https://github.com/vuejs/vue/issues/2870
		debouncedEmitOnSearch() {
			return debounce(this.emitOnSearch, 350)
		}
	},

	mounted() {
		// Set active tags from prop on mount
		this.search.activeTags = this.initialActiveTags
	},

	methods: {
		...mapActions('navigation', ['searchNavigationManager']),

		// #region Navigation
		toggleSearchMenu() {
			this.searchNavigationManager({ operation: 'toggle' })
		},
		// #endregion

		// #region Search bar
		async onSearchInput(event) {
			const inputData = event.target.value

			// Replace empty spaces with underscores
			const replacedInputData = inputData.replace(/\s+/g, '_')

			this.search.query = replacedInputData

			if (this.search.query.length === 0) {
				this.debouncedEmitOnSearch.cancel()
				this.emitResetSearchResults()
				return
			}

			await this.debouncedEmitOnSearch(this.search.query)
		},

		onSearchEnter(tag) {
			this.debouncedEmitOnSearch.cancel()

			this.mergeWithActiveTags([this.search.query])
		},

		emitOnSearch() {
			this.$emit('search', this.search.query)
		},

		emitResetSearchResults() {
			this.$emit('reset-search-results')
		},

		toggleBanMode() {
			this.isBanModeEnabled = !this.isBanModeEnabled
		},

		toggleTagCollections() {
			if (!this.isUserPremium) {
				this.$router.push({ name: 'premium' })
				return
			}

			this.tagCollections.isActive = !this.tagCollections.isActive
		},
		// #endregion

		// #region Search results
		addToActiveTagConsideringBanMode(tag) {
			const prefix = this.isBanModeEnabled ? '-' : ''

			this.mergeWithActiveTags([prefix + tag])
		},

		removeFromActiveTags(tagToRemove) {
			this.search.activeTags = this.search.activeTags.filter((tag) => tag !== tagToRemove)
		},

		mergeWithActiveTags(tags) {
			this.search.activeTags = [...new Set([...this.search.activeTags, ...tags])]
		},

		resetActiveTags() {
			this.search.activeTags = []
		},

		emitSubmitActiveTags() {
			this.$emit('submit-active-tags', this.search.activeTags)

			this.emitResetSearchResults()

			this.toggleSearchMenu()
		}
		// #endregion
	}
}
</script>
