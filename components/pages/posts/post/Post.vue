<template>
	<figure class="material-container">
		<!-- Media -->
		<template v-if="isImage">
			<!-- Fix for weird space below button -->
			<div class="flex overflow-hidden">
				<button
					:aria-expanded="isActive"
					aria-label="Toggle tags panel"
					class="group pointer-events-auto relative h-auto w-full"
					type="button"
					@click="toggleTags"
					@keydown.enter="toggleTags"
				>
					<!-- Image -->
					<PostMedia
						:mediaAlt="mediaFile.alt"
						:mediaSrc="mediaFile.file"
						:mediaSrcHeight="mediaFile.height"
						:mediaSrcWidth="mediaFile.width"
						:mediaType="post.data.media_type"
					/>

					<!-- Fix for focus ring not applying on other elements -->
					<div class="group-focus-visible:focus-util pointer-events-none absolute inset-0 ring-inset"></div>
				</button>
			</div>
		</template>

		<!-- Media -->
		<template v-else-if="isVideo">
			<div class="relative">
				<!-- Video -->
				<PostMedia
					:mediaAlt="mediaFile.alt"
					:mediaPosterSrc="mediaFile.posterFile"
					:mediaSrc="mediaFile.file"
					:mediaSrcHeight="mediaFile.height"
					:mediaSrcWidth="mediaFile.width"
					:mediaType="post.data.media_type"
				/>

				<!-- Video tag button -->
				<div class="pointer-events-none absolute inset-y-0 right-0 p-4">
					<div class="flex h-full w-full flex-col items-center justify-center">
						<button
							:aria-expanded="isActive"
							aria-label="Toggle tags panel"
							class="focus-visible:focus-util group pointer-events-auto rounded-lg border border-transparent bg-black bg-opacity-40 p-1"
							type="button"
							@click="toggleTags"
							@keydown.enter="toggleTags"
						>
							<TagIcon class="icon h-5 w-5 text-gray-200 transition-colors duration-300 group-hover:text-white" />
						</button>
					</div>
				</div>
			</div>
		</template>

		<figcaption class="flex flex-wrap overflow-hidden text-sm">
			<!-- Action bar & Tags -->
			<template v-if="isActive">
				<div class="w-full overflow-hidden">
					<!-- Action bar -->
					<div class="flex items-center justify-evenly bg-darkGray-500">
						<!-- Actions -->
						<!-- Saucenao -->
						<template v-if="!isVideo">
							<PostSaucenao :media-url="mediaFile.file" />
						</template>

						<!-- Download -->
						<PostDownload
							:media-name="post.id"
							:media-url="mediaFile.file"
						/>

						<!-- Save post -->
						<PostSavedPosts :post="post" />
					</div>

					<!-- Tags -->
					<div class="tag-container min-w-full">
						<!-- -->

						<!-- Tags -->
						<template v-for="tag in tagsAsSingleArray">
							<!--                  -->

							<template v-if="eventOnly">
								<button
									:key="tag.name"
									:class="{
										'bg-amber-900': tag.type === 'artist',
										'bg-green-900': tag.type === 'copyright',
										'bg-emerald-900': tag.type === 'character'
									}"
									class="tag link"
									type="button"
									@click="emitTagSelected(tag.name)"
								>
									{{ tag.name }}
								</button>
							</template>

							<template v-else>
								<NuxtLink
									:key="tag.name"
									:class="{
										'bg-amber-900': tag.type === 'artist',
										'bg-green-900': tag.type === 'copyright',
										'bg-emerald-900': tag.type === 'character'
									}"
									:to="generatePostsRouteWithDefaults($nuxt.$store, undefined, undefined, [tag.name])"
									class="tag link"
								>
									{{ tag.name }}
								</NuxtLink>
							</template>
						</template>
					</div>
				</div>
			</template>

			<!-- Source -->
			<template v-if="post.data.sources.length">
				<!-- -->
				<div class="w-full bg-darkGray-500 text-center">
					<!-- If text is an URL then make it a link -->
					<template v-if="isSourceAnUrl">
						<a
							:href="post.data.sources[0]"
							class="link inline-flex gap-2 px-1 py-1.5"
							rel="noopener nofollow"
							target="_blank"
						>
							<p class="link">
								{{ getHostnameFromUrl(post.data.sources[0]) }}
							</p>

							<!-- Icon -->
							<ExternalLinkIcon class="icon h-5 w-5" />
						</a>
					</template>

					<!-- If the text is not a src then just show the text -->
					<template v-else>
						<p
							class="p-1 text-gray-200"
							title="Source"
						>
							{{ post.data.sources[0] }}
						</p>
					</template>
				</div>
			</template>
		</figcaption>
	</figure>
</template>

<script>
import { mapGetters } from 'vuex'
import { ExternalLinkIcon, TagIcon } from 'vue-feather-icons'
import { RouterHelper } from '~/assets/js/RouterHelper'
import PostMedia from '~/components/pages/posts/post/PostMedia.vue'

export default {
	components: { PostMedia, ExternalLinkIcon, TagIcon },

	props: {
		post: {
			type: Object,
			required: true
		},

		eventOnly: {
			type: Boolean,
			default: false
		}
	},

	data() {
		return {
			isActive: false
		}
	},

	computed: {
		...mapGetters('user', ['getUserSettings']),

		isImage() {
			return this.post.data.media_type === 'image'
		},

		isVideo() {
			return this.post.data.media_type === 'video'
		},

		isSourceAnUrl() {
			if (!this.post.data.sources.length) {
				return false
			}

			let source

			try {
				source = new URL(this.post.data.sources[0])
			} catch {
				return false
			}

			return source.protocol === 'http:' || source.protocol === 'https:'
		},

		mediaFile() {
			const data = {
				file: null,
				width: null,
				height: null,
				posterFile: null,
				alt: 'Post with tags: ' + this.tagsAsSingleArray.map((tag) => tag.name).join(', ')
			}

			switch (true) {
				case this.isImage: {
					// Return full image if its setting is enabled OR if low resolution file doesn't exist
					if (!this.post.data.low_res_file.url || this.getUserSettings.fullSizeImages.value) {
						data.file = this.post.data.high_res_file.url
						data.width = this.post.data.high_res_file.width
						data.height = this.post.data.high_res_file.height
					} else {
						// Return low res file
						data.file = this.post.data.low_res_file.url
						data.width = this.post.data.low_res_file.width
						data.height = this.post.data.low_res_file.height
					}

					break
				}

				case this.isVideo: {
					data.file = this.post.data.high_res_file.url
					data.width = this.post.data.high_res_file.width
					data.height = this.post.data.high_res_file.height

					data.posterFile = this.post.data.preview_file.url
					break
				}
			}

			return data
		},

		/**
		 * Take in an object of tags like { character: ['tag1', 'tag2'], artist: ['tag3', 'tag4'] }
		 * and return an array of tags like [{ name: 'tag1', type: 'character' }, { name: 'tag2', type: 'character' }, { name: 'tag3', type: 'artist' }, { name: 'tag4', type: 'artist' }]
		 * @returns {Array<{ name: string, type: string }>}
		 */
		tagsAsSingleArray() {
			const tags = []

			for (const [type, tagsArray] of Object.entries(this.post.data.tags)) {
				for (const tag of tagsArray) {
					tags.push({ name: tag, type })
				}
			}

			return tags
		}
	},

	methods: {
		generatePostsRouteWithDefaults: RouterHelper.generatePostsRouteWithDefaults,

		getHostnameFromUrl(url) {
			const source = new URL(url)

			return source.hostname
		},

		toggleTags() {
			this.isActive = !this.isActive
		},

		emitTagSelected(tag) {
			this.$emit('tag-selected', tag)
		}
	}
}
</script>
