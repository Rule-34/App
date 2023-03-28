<template>
	<main class="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
		<template v-if="isUserPremium">
			<div class="flex w-full flex-auto flex-col space-y-4">
				<!-- Dashboard -->
				<div class="material-container p-4">
					<!-- Icon and email -->
					<div class="truncate py-1">
						<!-- Icon -->
						<span class="border-util inline-flex h-10 w-10 items-center justify-center rounded-full bg-darkGray-700">
							<span class="font-medium leading-none text-white">
								{{ getUserEmail.charAt(0).toUpperCase() }}
							</span>
						</span>

						<!-- Email -->
						<span class="ml-1 text-gray-200">{{ getUserEmail }}</span>
					</div>

					<!-- Status -->
					<div class="my-1 text-center">
						<p class="text-gray-300">Your subscription is</p>
						<p class="text-3xl font-semibold text-accent-400">Active</p>
					</div>

					<!-- Log out -->
					<button
						class="link ml-auto block leading-none"
						type="button"
						@click="logOut"
					>
						Log out
					</button>
				</div>

				<!-- Custom Booru  -->
				<div class="material-container flex flex-row items-center p-4">
					<div class="flex-auto">
						<h1 class="text-lg font-medium text-gray-200">Custom Boorus</h1>
						<p class="text-gray-300">Manage compatible boorus</p>
					</div>

					<NuxtLink
						class="link border-util rounded-full bg-darkGray-700 px-3 py-2"
						to="/premium/custom-boorus"
					>
						<ChevronRightIcon class="icon h-6 w-6 text-inherit" />
					</NuxtLink>
				</div>

				<!-- Custom Tag Collections  -->
				<div class="material-container flex flex-row items-center p-4">
					<div class="grow">
						<h1 class="text-lg font-medium text-gray-200">Tag Collections</h1>
						<p class="text-gray-300">Manage your collections of tags</p>
					</div>

					<NuxtLink
						class="link border-util rounded-full bg-darkGray-700 px-3 py-2"
						to="/premium/tag-collections"
					>
						<ChevronRightIcon class="icon h-6 w-6 text-inherit" />
					</NuxtLink>
				</div>

				<!-- Saved Posts  -->
				<div class="material-container flex flex-row items-center p-4">
					<div class="grow">
						<h1 class="text-lg font-medium text-gray-200">Saved Posts</h1>
						<p class="text-gray-300">Manage your saved posts</p>
					</div>

					<NuxtLink
						class="link border-util rounded-full bg-darkGray-700 px-3 py-2"
						to="/premium/saved-posts"
					>
						<ChevronRightIcon class="icon h-6 w-6 text-inherit" />
					</NuxtLink>
				</div>

				<!-- Backup  -->
				<div class="material-container flex flex-row items-center p-4">
					<div class="grow">
						<h1 class="text-lg font-medium text-gray-200">Backup</h1>
						<p class="text-gray-300">Save your App data</p>
					</div>

					<NuxtLink
						class="link border-util rounded-full bg-darkGray-700 px-3 py-2"
						to="/premium/backup"
					>
						<ChevronRightIcon class="icon h-6 w-6 text-inherit" />
					</NuxtLink>
				</div>

				<!-- Spacer -->
				<div class="grow" />

				<!-- Notice -->
				<p class="text-center text-sm text-gray-300">
					Manage your subscription on
					<a
						class="link"
						href="https://gumroad.com/library"
						rel="noopener nofollow"
						target="_blank"
					>
						Gumroad</a
					>.
				</p>
			</div>
		</template>

		<template v-else>
			<div class="flex w-full flex-auto flex-col justify-evenly gap-4">
				<!-- Log In -->
				<PremiumLogin />

				<!-- Separator -->
				<p class="text-center text-gray-300">Or</p>

				<PremiumSubscription />

				<a
					class="link text-center"
					href="https://www.rule34.app/premium"
					rel="noopener"
					target="_blank"
				>
					Learn more about Premium features
				</a>
			</div>
		</template>
	</main>
</template>

<script>
import { ChevronRightIcon } from 'vue-feather-icons'
import { mapGetters } from 'vuex'

export default {
	components: {
		ChevronRightIcon
	},

	head() {
		return {
			title: 'Premium',
			meta: [
				{
					hid: 'description',
					name: 'description',
					content: 'Premium subscription.'
				}
			]
		}
	},

	computed: {
		...mapGetters('premium', ['isUserPremium', 'getUserEmail'])
	},

	methods: {
		async logOut() {
			await this.$auth.logout()

			location.reload()
		}
	}
}
</script>
