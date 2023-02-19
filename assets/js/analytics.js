// Send tags in an interval of .5 seconds to not flood the analytics server
function SendTimed(index, passedCallback) {
	setTimeout(passedCallback, 500 * index)
}

function trackEvent({ category, action, name, value }) {
	console.debug(`
  ---- Tracking event ----
  Category: ${category}
  Action: ${action}
  Name: ${name}
  Value: ${value}
  `)

	window._paq.push(['trackEvent', category, action, name, value])
}

function notificationsTracking() {
	SendTimed(
		0,
		trackEvent({
			category: 'Notifications',
			action: 'Open'
		})
	)
}

/* -------- Analytics -------- */
export default function fireAnalytics(mode, { state, domain } = {}) {
	let result

	switch (mode) {
		case 'notifications':
			result = notificationsTracking()
			break

		default:
			throw new Error('No mode specified')
	}

	return result
}
