import {
  createStateFromStore,
  migrateState,
  restoreStateToStore
} from '~/assets/js/MigrateState'

export default (context) => {
  const { store } = context

  const STATE = createStateFromStore(store)

  const MIGRATED_STATE = migrateState(STATE)

  restoreStateToStore(MIGRATED_STATE, store)
}
