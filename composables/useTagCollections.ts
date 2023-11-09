import { useStorage, useToggle } from '@vueuse/core'
import { TagCollection } from '~/assets/js/tagCollection.dto'
import { cloneDeep } from 'lodash-es'

const defaultTagCollections: TagCollection[] = [
  {
    name: 'Indecencies Blocklist',
    tags: ['-scat', '-shitting', '-diaper', '-pee', '-peeing', '-peeing_self', '-fart', '-shitpost', '-gore', '-vore']
  },
  {
    name: 'Furry Blocklist',
    tags: [
      '-furry',
      '-furry_only',
      '-fur',
      '-canid',
      '-canine',
      '-dragon',
      '-anthro',
      '-anthrofied',
      '-anthro_on_anthro',
      '-scaly',
      '-scales',
      '-accipitrid',
      '-accipitriform',
      '-animal_genitalia',
      '-ferrettre',
      '-rodent',
      '-equine'
    ]
  },
  {
    name: 'Gay Blocklist',
    tags: [
      '-gay',
      '-gay_sex',
      '-solo_male',
      '-male_only',
      '-male_focus',
      '-male/male',
      '-male_penetrated',
      '-male_penetrating_male'
    ]
  },
  {
    name: 'AI Blocklist',
    tags: ['-ai_generated', '-ai-generated', '-stable_diffusion']
  }
]

const tagCollections = useStorage('user-tagCollections', cloneDeep(defaultTagCollections), localStorage, {
  writeDefaults: false
})

export function useTagCollections() {
  const [value, toggle] = useToggle(false)

  return {
    isActive: value,
    toggleIsActive: toggle,

    tagCollections,

    resetTagCollections() {
      tagCollections.value = cloneDeep(defaultTagCollections)
    }
  }
}
