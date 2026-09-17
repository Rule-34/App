import { describe, expect, it } from 'vitest'
import { TagCollection, TagCollectionDTO, type ITagCollection } from '../../app/assets/js/tagCollection.dto'

describe('TagCollectionDTO', () => {
  it('initializes with default values', () => {
    const dto = new TagCollectionDTO()

    expect(dto.name).toBe('')
    expect(dto.tags).toEqual([])
  })
})

describe('TagCollection', () => {
  it('instantiates and clones tags array from input DTO', () => {
    const input: ITagCollection = {
      name: 'Favorites',
      tags: ['tag1', 'tag2', 'tag3']
    }

    const collection = new TagCollection(input)

    expect(collection.name).toBe('Favorites')
    expect(collection.tags).toEqual(['tag1', 'tag2', 'tag3'])

    // Modifying the source array should not mutate the collection instance
    input.tags.push('tag4')
    expect(collection.tags).toEqual(['tag1', 'tag2', 'tag3'])
  })

  it('handles empty tags array properly', () => {
    const input: ITagCollection = {
      name: 'Empty List',
      tags: []
    }

    const collection = new TagCollection(input)

    expect(collection.name).toBe('Empty List')
    expect(collection.tags).toEqual([])
  })
})
