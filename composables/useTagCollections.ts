import { useStorage, useToggle } from '@vueuse/core'

const defaultTagCollections = [
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
    name: 'Indecencies Blocklist',
    tags: ['-scat', '-shitting', '-diaper', '-pee', '-peeing', '-peeing_self', '-fart', '-shitpost', '-gore', '-vore']
  },
  {
    name: 'AI Blocklist',
    tags: ['-ai_generated', '-ai-generated', '-stable_diffusion']
  }
]

const tagCollections = useStorage('user-tagCollections', defaultTagCollections, localStorage, {
  writeDefaults: false
})

export function useTagCollections() {
  const [value, toggle] = useToggle(false)

  return {
    isActive: value,
    toggleIsActive: toggle,

    tagCollections
  }
}
