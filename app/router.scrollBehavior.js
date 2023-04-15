export default function (to, from, savedPosition) {
	if (savedPosition) {
		return savedPosition
	}

	// Skip scroll in Post pages
	if (
		to.name === from.name &&
		to.path === from.path &&
		to.hash === from.hash &&
		// Is a Post page
		['index'].includes(to.name) &&
		// Has same [domain, tags], but different [page]
		to.query.domain === from.query.domain &&
		to.query.tags === from.query.tags &&
		to.query.page !== from.query.page
	) {
		return false
	}

	return { x: 0, y: 0 }
}
