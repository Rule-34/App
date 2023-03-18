<template>
	<!-- Apply touch for showing menu and search -->
	<div
		v-touch="{
			left: (e) => touchHandler('left', e),
			right: (e) => touchHandler('right', e)
		}"
	>
		<AnnouncementBanner />

		<SideNavArea />

		<transition name="sidenav">
			<SideNav v-if="isSideNavActive" />
		</transition>

		<portal-target name="search" />

		<portal-target name="body" />

		<SupportPopUpManager />

		<!-- Layout content -->
		<Nuxt />
	</div>
</template>

<script>
import { mapGetters } from 'vuex'

// Third party
import { Touch } from 'vuetify/lib/directives/touch'

import NavigationMixin from '~/components/layout/navigation/NavigationMixin.js'
import TouchHandlerMixin from '~/components/layout/navigation/sidenav/TouchHandlerMixin.js'

export default {
	directives: { Touch },

	/**
	 * Warning:
	 * Some methods and variables are set by Mixins
	 */
	mixins: [NavigationMixin, TouchHandlerMixin],

	head() {
		return {
			// Define color theme based on settings
			bodyAttrs: {
				class: 'bg-darkGray-700'
			}
		}
	},

	computed: {
		...mapGetters('navigation', ['isSideNavActive']),
		...mapGetters('user', ['getUserSettings'])
	}
}

console.info(
	'%cWe ❤︎ open source!',
	'font-size:32px;font-weight:bold;letter-spacing:0.02em;color:hsl(205, 78%, 62%);background-color:white;padding:8px 16px;'
)
console.info(
	'%cContribute: https://redirect.r34.app/github\nJoin our discord: https://redirect.r34.app/discord',
	'background-color:hsl(0, 0%, 7%);padding:4px 8px;font-size:16px;color:white;'
)
</script>

<style lang="postcss">
/* Transition */

/* Initial state */
.sidenav-enter,
.sidenav-leave-to {
	transform: translateX(-100vw);
}

/* Toggled stated */
.sidenav-enter-to {
	transform: translateX(0px);
}

/* Transition that is gonna be applied */
.sidenav-enter-active,
.sidenav-leave-active {
	@apply transition-transform duration-300;
}
</style>
