import { cloneDeep } from 'lodash-es'
import { migrateState } from '~/assets/js/MigrateState'

export default (context) => {
  const { store } = context

  const state = cloneDeep(store.state)

  const migratedState = migrateState(state)

  store.replaceState(migratedState)
}
