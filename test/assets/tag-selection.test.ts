import { describe, expect, it } from 'vitest'
import Tag, { toggleSelectedTag } from '../../app/assets/js/tag.dto'

function selectedTagNames(names: readonly string[], tag: string) {
  const selectedTags = names.map((name) => new Tag({ name }))

  return toggleSelectedTag(selectedTags, tag).map((selectedTag) => selectedTag.name)
}

describe('toggleSelectedTag', () => {
  it('adds the tag to the selection', () => {
    expect(selectedTagNames([], 'solo')).toEqual(['solo'])
    expect(selectedTagNames(['1girl'], 'solo')).toEqual(['1girl', 'solo'])
  })

  it('keeps the given tag type and count', () => {
    const [addedTag] = toggleSelectedTag([], 'seiza')

    expect(addedTag).toEqual(new Tag({ name: 'seiza' }).toJSON())
  })

  it('removes the tag when it is already selected', () => {
    expect(selectedTagNames(['1girl', 'solo'], 'solo')).toEqual(['1girl'])
    expect(selectedTagNames(['-yaoi'], '-yaoi')).toEqual([])
  })

  it('drops the positive tag when its negative form is added', () => {
    expect(selectedTagNames(['solo', '1girl'], '-solo')).toEqual(['1girl', '-solo'])
  })

  it('drops the negative tag when its positive form is added', () => {
    expect(selectedTagNames(['-solo', '1girl'], 'solo')).toEqual(['1girl', 'solo'])
  })

  it('does not keep both forms of the same tag', () => {
    const withExcludedTag = selectedTagNames(['solo'], '-solo')
    const withPositiveTag = selectedTagNames(withExcludedTag, 'solo')

    expect(withExcludedTag).toEqual(['-solo'])
    expect(withPositiveTag).toEqual(['solo'])
  })

  it('does not mutate the given selection', () => {
    const selectedTags = [new Tag({ name: '1girl' })]

    toggleSelectedTag(selectedTags, 'solo')
    toggleSelectedTag(selectedTags, '1girl')

    expect(selectedTags).toEqual([{ name: '1girl' }])
  })
})
