<template>
	<div>
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
					>
						Learn more
					</a>
				</template>
			</Error>
		</template>

		<!-- Image -->
		<template v-else-if="isImage">
			<img
				ref="imageElement"
				:alt="mediaAlt"
				:class="{
					'opacity-100': media.hasLoaded
				}"
				:height="mediaSrcHeight"
				:src="mediaSrc"
				:width="mediaSrcWidth"
				class="h-auto w-full opacity-0 transition-opacity duration-700"
				decoding="async"
				loading="lazy"
				referrerpolicy="no-referrer"
				@error="retryToLoadManager"
				@load="media.hasLoaded = true"
			/>
		</template>

		<!-- Video -->
		<template v-else-if="isVideo">
			<video
				ref="videoElement"
				v-intersect="{
					handler: VideoOutOfViewHandler,
					options: {
						threshold: [0]
					}
				}"
				:height="mediaSrcHeight"
				:poster="mediaPosterSrc"
				:width="mediaSrcWidth"
				class="h-auto w-full"
				controls
				loop
				playsinline
				preload="none"
			>
				<source
					:src="mediaSrc"
					@error="retryToLoadManager"
				/>
			</video>
		</template>
	</div>
</template>

<script>
import { ProxyHelper } from '~/assets/js/ProxyHelper'
import { Intersect } from 'vuetify/lib/directives/intersect'
import { mapGetters } from 'vuex'

export default {
	name: 'PostMedia',

	directives: {
		Intersect
	},

	props: {
		mediaSrc: {
			type: String,
			required: false
		},
		mediaSrcHeight: {
			type: Number,
			required: false
		},
		mediaSrcWidth: {
			type: Number,
			required: false
		},
		mediaPosterSrc: {
			type: String,
			required: false
		},
		mediaType: {
			type: String,
			required: true
		},
		mediaAlt: {
			type: String,
			required: false
		}
	},

	data() {
		return {
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
		...mapGetters('premium', ['isUserPremium']),

		isImage() {
			return this.mediaType === 'image'
		},

		isVideo() {
			return this.mediaType === 'video'
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
		async retryToLoadManager(event) {
			if (this.error.show) {
				return
			}

			if (this.$nuxt.isOffline) {
				this.error.message = 'Browser is offline'
				this.error.show = true
				return
			}

			// Add extra slash to URL
			if (!this.media.retryLogic.tried.extraSlash) {
				console.info('Adding extra slash...')

				event.target.src = this.addExtraSlashToURL(this.mediaSrc)

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

				event.target.src = ProxyHelper.proxyUrl(this.mediaSrc)

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

				event.target.src = ProxyHelper.proxyUrl(this.addExtraSlashToURL(this.mediaSrc))

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

				event.target.src = this.mediaSrc

				if (this.isVideo) {
					console.info('Reloading data and playing video')
					event.target.parentElement.load()
					await event.target.parentElement.play()
				}

				this.media.retryLogic.count++
			}

			// At last, show error
			else {
				this.error.message = 'Can not load media'
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
