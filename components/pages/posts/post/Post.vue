<template>
	<figure class="material-container">
		<!-- Error -->
		<template v-if="error.show">
			<Error
				:error-data="error.message"
				:render-borders="false"
			>
				<template #customAction>
					<a
						class="link"
						href="https://www.rule34.app/frequently-asked-questions#74cfdf0316b04111b0c65b7f8502dfda"
						rel="noopener"
						target="_blank"
						>Learn more</a
					>
				</template>
			</Error>
		</template>

		<!-- Media -->
		<template v-else-if="isImage">
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
					<img
						:key="mediaFile[0].url"
						ref="imageElement"
						:alt="'Image ' + post.data.id"
						:class="{
							'opacity-100': media.hasLoaded
						}"
						:height="mediaFile[0].height"
						:src="mediaFile[0].url"
						:width="mediaFile[0].width"
						class="h-auto w-full opacity-0 transition-opacity duration-700"
						decoding="async"
						loading="lazy"
						referrerpolicy="no-referrer"
						@error="retryToLoadManager"
						@load="media.hasLoaded = true"
					/>

					<!-- Fix for focus ring not applying on other elements -->
					<div class="group-focus-visible:focus-util pointer-events-none absolute inset-0 ring-inset"></div>
				</button>
			</div>
		</template>

		<!-- Media -->
		<template v-else-if="isVideo">
			<div
				v-intersect="{
					handler: VideoOutOfViewHandler,
					options: {
						threshold: [0]
					}
				}"
				class="relative"
			>
				<video
					:key="mediaFile[0].url"
					ref="videoElement"
					:poster="mediaFile[1].url"
					class="h-auto w-full"
					controls
					loop
					playsinline
					preload="none"
				>
					<source
						:src="mediaFile[0].url"
						@error="retryToLoadManager"
					/>
					Your browser does not support HTML5 video
				</video>

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
			<template>
				<div class="w-full overflow-hidden">
					<TransitionCollapse>
						<!-- Workaround for content not jumping is having a div before -->
						<div v-show="isActive">
							<!-- Action bar -->
							<div class="flex items-center justify-evenly bg-darkGray-100">
								<!-- Actions -->
								<template v-if="!error.show">
									<!-- Saucenao -->
									<template v-if="!isVideo">
										<PostSaucenao :media-url="mediaFile[0].url" />
									</template>

									<!-- Download -->
									<PostDownload
										:media-name="post.id"
										:media-url="mediaFile[0].url"
									/>

									<!-- Save post -->
									<PostSavedPosts :post="post" />
								</template>
							</div>

							<!-- Tags -->
							<div class="tag-container min-w-full">
								<!-- -->

								<!-- Character tags -->
								<template v-for="tag in post.data.tags.character">
									<template v-if="eventOnly">
										<button
											:key="tag"
											class="tag link"
											type="button"
											@click="emitTagSelected(tag)"
										>
											{{ tag }}
										</button>
									</template>

									<template v-else>
										<NuxtLink
											:key="tag"
											:to="generatePostsRouteWithDefaults($nuxt.$store, undefined, undefined, [tag])"
											class="tag link"
										>
											{{ tag }}
										</NuxtLink>
									</template>
								</template>

								<!-- Copyright tags -->
								<template v-for="tag in post.data.tags.copyright">
									<template v-if="eventOnly">
										<button
											:key="tag"
											class="tag link"
											type="button"
											@click="emitTagSelected(tag)"
										>
											{{ tag }}
										</button>
									</template>

									<template v-else>
										<NuxtLink
											:key="tag"
											:to="generatePostsRouteWithDefaults($nuxt.$store, undefined, undefined, [tag])"
											class="tag link"
										>
											{{ tag }}
										</NuxtLink>
									</template>
								</template>

								<!-- Artist tags -->
								<template v-for="tag in post.data.tags.artist">
									<template v-if="eventOnly">
										<button
											:key="tag"
											class="tag link"
											type="button"
											@click="emitTagSelected(tag)"
										>
											{{ tag }}
										</button>
									</template>

									<template v-else>
										<NuxtLink
											:key="tag"
											:to="generatePostsRouteWithDefaults($nuxt.$store, undefined, undefined, [tag])"
											class="tag link"
										>
											{{ tag }}
										</NuxtLink>
									</template>
								</template>

								<!-- General tags -->
								<template v-for="tag in post.data.tags.general">
									<template v-if="eventOnly">
										<button
											:key="tag"
											class="tag link"
											type="button"
											@click="emitTagSelected(tag)"
										>
											{{ tag }}
										</button>
									</template>

									<template v-else>
										<NuxtLink
											:key="tag"
											:to="generatePostsRouteWithDefaults($nuxt.$store, undefined, undefined, [tag])"
											class="tag link"
										>
											{{ tag }}
										</NuxtLink>
									</template>
								</template>

								<!-- Meta tags -->
								<template v-for="tag in post.data.tags.meta">
									<template v-if="eventOnly">
										<button
											:key="tag"
											class="tag link"
											type="button"
											@click="emitTagSelected(tag)"
										>
											{{ tag }}
										</button>
									</template>

									<template v-else>
										<NuxtLink
											:key="tag"
											:to="generatePostsRouteWithDefaults($nuxt.$store, undefined, undefined, [tag])"
											class="tag link"
										>
											{{ tag }}
										</NuxtLink>
									</template>
								</template>
							</div>
						</div>
					</TransitionCollapse>
				</div>
			</template>

			<!-- Source -->
			<template v-if="post.data.sources.length">
				<!-- -->
				<div class="w-full text-center">
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
import { Intersect } from 'vuetify/lib/directives/intersect'
import { RouterHelper } from '~/assets/js/RouterHelper'
import { ProxyHelper } from '~/assets/js/ProxyHelper'

export default {
	components: { ExternalLinkIcon, TagIcon },

	directives: {
		Intersect
	},

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
			isActive: false,

			media: {
				hasLoaded: false,

				retryLogic: {
					count: 0,

					tried: {
						extraSlash: false,
						proxy: false,
						proxyWithExtraSlash: false
					}
				}
			},

			error: {
				show: false,
				message: 'An error ocurred'
			}
		}
	},

	computed: {
		...mapGetters('user', ['getUserSettings']),
		...mapGetters('booru', ['getActiveBooru']),
		...mapGetters('premium', ['isUserPremium']),

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
			// If it is a video
			if (this.isVideo && this.post.data.high_res_file) {
				return [this.post.data.high_res_file, this.post.data.preview_file]
			}

			// Return full image if its setting is enabled OR if low resolution file doesn't exist
			if (!this.post.data.low_res_file.url || this.getUserSettings.fullSizeImages.value) {
				return [this.post.data.high_res_file, null]
			}

			// Return low res file
			return [this.post.data.low_res_file, null]
		}
	},

	created() {
		if (!this.isVideo && !this.isImage) {
			const message = 'Unknown media type'

			console.warn(message)

			this.error.message = message
			this.error.show = true
		}

		if (!this.post.data.high_res_file.url && !this.post.data.low_res_file.url) {
			const message = 'No media available'

			console.warn(message)

			this.error.message = message
			this.error.show = true
		}
	},

	beforeDestroy() {
		// Cancel any pending HTTP requests
		if (this.isImage) {
			const imageElement = this.$refs['imageElement']

			if (imageElement) {
				// TODO: This trick only works in Chrome
				imageElement.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
				imageElement.onload = null
				imageElement.onerror = null
			}
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
		},

		async retryToLoadManager(event) {
			if (this.error.show) {
				const message = 'An error is set'

				console.warn(message)
				return
			}

			if (this.$nuxt.isOffline) {
				const message = 'Browser is offline'

				console.warn(message)

				this.error.message = message
				this.error.show = true
				return
			}

			// Add extra slash to URL
			if (!this.media.retryLogic.tried.extraSlash) {
				console.info('Adding extra slash...')

				event.target.src = this.addExtraSlashToURL(this.mediaFile[0].url)

				if (this.isVideo) {
					console.info('Reloading data and playing video')
					event.target.parentElement.load()
					await event.target.parentElement.play()
				}

				this.media.retryLogic.tried.extraSlash = true
			}

			// Proxy URL
			else if (this.isUserPremium && !this.media.retryLogic.tried.proxy) {
				console.info('Proxying media...')

				event.target.src = ProxyHelper.proxyUrl(this.mediaFile[0].url)

				if (this.isVideo) {
					console.info('Reloading data and playing video')
					event.target.parentElement.load()
					await event.target.parentElement.play()
				}

				this.media.retryLogic.tried.proxy = true
			}

			// Proxy URL with extra slash
			else if (this.isUserPremium && !this.media.retryLogic.tried.proxyWithExtraSlash) {
				console.info('Proxying media with extra slash...')

				event.target.src = ProxyHelper.proxyUrl(this.addExtraSlashToURL(this.mediaFile[0].url))

				if (this.isVideo) {
					console.info('Reloading data and playing video')
					event.target.parentElement.load()
					await event.target.parentElement.play()
				}

				this.media.retryLogic.tried.proxyWithExtraSlash = true
			}

			// Retry to load it
			else if (this.media.retryLogic.count < 1) {
				console.info(`Retry number ${this.media.retryLogic.count} to load the media`)

				event.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='

				event.target.src = this.mediaFile[0].url

				if (this.isVideo) {
					console.info('Reloading data and playing video')
					event.target.parentElement.load()
					await event.target.parentElement.play()
				}

				this.media.retryLogic.count++
			}

			// At last, show error
			else {
				const message = 'Can not load media'

				console.warn(message)

				this.error.message = message
				this.error.show = true
			}
		},

		async VideoOutOfViewHandler() {
			const videoElement = this.$refs.videoElement

			if (!videoElement) {
				return
			}

			if (!videoElement.paused) {
				console.debug('Pausing video')

				await videoElement.pause()
			}
		},

		addExtraSlashToURL(url) {
			const currentURL = new URL(url)

			/* console.log({
        original: currentURL.toString(),
        modified: currentURLWithExtraSlash,
      }) */

			return currentURL.toString().replace(currentURL.hostname, currentURL.hostname + '/')
		}
	}
}
</script>
