import { createStateFromStore, restoreStateToStore } from '~/assets/js/StateHelper'
import { cleanState, migrateState } from '~/assets/js/MigrateState'

export default (context) => {
	const { store } = context

	let state = createStateFromStore(store)

	state = migrateState(state)

	state = cleanState(state)

	restoreStateToStore(state, store)
}
