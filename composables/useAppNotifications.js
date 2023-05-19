const appNotificationsUrl =
	'https://gist.githack.com/AlejandroAkbal/2fe43e0eee40be63d9b2a582b2793cf9/raw/app-notifications.json'

const state = reactive({
	data: null,

	latestTitle: null
})

export const useAppNotifications = () => {
	const hasNotificationsBeenFetched = computed(() => !!state.data)
	const isThereANewNotification = computed(() => {
		if (!state.data) {
			return false
		}

		if (!state.latestTitle) {
			return true
		}

		const areTitlesEqual = state.latestTitle.localeCompare(state.data[0].title)

		// Equal to 0 means they are identical
		return areTitlesEqual !== 0
	})

	const fetchNotifications = async () => {
		const response = await fetch(state.url)
		const data = await response.json()

		state.data = data
		state.latestTitle = data[0].title
	}

	watch(
		() => state.data,
		(newValue, oldValue) => {
			if (newValue !== oldValue) {
				console.log('Notifications have been updated')
			}
		}
	)

	return {
		data: state.data,
		load,
		isThereNewNotifications
	}
}
