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
				v-intersect="{
					handler: mediaLoader,
					options: {
						rootMargin: '1250px'
					}
				}"
				:alt="mediaAlt"
				:class="{
					'opacity-100': media.hasLoaded
				}"
				:data-src="mediaSrc"
				:height="mediaSrcHeight"
				:width="mediaSrcWidth"
				class="h-auto w-full opacity-0 transition-opacity duration-700"
				decoding="async"
				loading="lazy"
				referrerpolicy="no-referrer"
				src=""
				@error="retryToLoadManager"
				@load="media.hasLoaded = true"
			/>
		</template>

		<!-- Video -->
		<template v-else-if="isVideo">
			<video
				ref="videoElement"
				v-intersect="{
					handler: mediaLoader,
					options: {
						rootMargin: '1250px'
					}
				}"
				:data-src="mediaSrc"
				:height="mediaSrcHeight"
				:poster="mediaPosterSrc"
				:width="mediaSrcWidth"
				class="h-auto w-full"
				controls
				loop
				playsinline
				preload="none"
				src=""
				@error="retryToLoadManager"
			/>
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

	methods: {
		async retryToLoadManager(event) {
			// TODO: Support videos

			if (this.error.show) {
				return
			}

			if (this.$nuxt.isOffline) {
				this.error.message = 'Browser is offline'
				this.error.show = true
				return
			}

			// Check if src is empty
			if (event.target.src === '') {
				return
			}

			console.log(event.target.src)

			// Add extra slash to URL
			if (!this.media.retryLogic.tried.extraSlash) {
				console.info('Adding extra slash...')

				const newSrc = this.addExtraSlashToURL(this.mediaSrc)

				event.target.setAttribute('data-src', newSrc)
				event.target.src = newSrc

				this.media.retryLogic.tried.extraSlash = true
			}

			// Proxy URL
			else if (this.isUserPremium && !this.media.retryLogic.tried.proxy) {
				console.info('Proxying media...')

				const newSrc = ProxyHelper.proxyUrl(this.mediaSrc)

				event.target.setAttribute('data-src', newSrc)
				event.target.src = newSrc

				this.media.retryLogic.tried.proxy = true
			}

			// Proxy URL with extra slash
			else if (this.isUserPremium && !this.media.retryLogic.tried.proxyWithExtraSlash) {
				console.info('Proxying media with extra slash...')

				const newSrc = ProxyHelper.proxyUrl(this.addExtraSlashToURL(this.mediaSrc))

				event.target.setAttribute('data-src', newSrc)
				event.target.src = newSrc

				this.media.retryLogic.tried.proxyWithExtraSlash = true
			}

			// At last, show error
			else {
				this.error.message = 'Can not load media'
				this.error.show = true
			}
		},

		/**
		 * Sets the media src from data-src attribute
		 */
		mediaLoader(entries, observer) {
			if (!entries || !entries.length) {
				return
			}

			// Smallest image possible - https://stackoverflow.com/a/36610159/11398632
			const smallestImage =
				'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='
			const smallestVideo = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAABZAAAACR0eXBlbWFw'

			const smallestMedia = this.isImage ? smallestImage : smallestVideo

			for (const entry of entries) {
				const mediaElement = entry.target

				const newSrc = entry.isIntersecting ? mediaElement.getAttribute('data-src') : smallestMedia

				mediaElement.src = newSrc
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
