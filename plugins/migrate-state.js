import { migrateState } from '~/assets/js/MigrateState'

export default (context) => {
  const { store } = context

  const state = structuredClone(store.state)

  const migratedState = migrateState(state)

  store.replaceState(migratedState)
}
