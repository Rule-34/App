import { migrateState } from '~/assets/js/MigrateState'
import { cloneDeep } from 'lodash-es' 

export default (context) => {
  const { store } = context

  const state = cloneDeep(store.state)

  const migratedState = migrateState(state)

  store.replaceState(migratedState)
}
