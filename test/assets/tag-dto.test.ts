import { describe, expect, it } from 'vitest'
import Tag, { TagDTO } from '../../app/assets/js/tag.dto'
import { TagCollection, TagCollectionDTO } from '../../app/assets/js/tagCollection.dto'

describe('Tag and TagDTO', () => {
  it('TagDTO initializes with default name and exports to JSON', () => {
    const tagDto = new TagDTO()
    expect(tagDto.name).toBe('')
    expect(tagDto.type).toBeUndefined()
    expect(tagDto.count).toBeUndefined()
    expect(tagDto.toJSON()).toEqual({ name: '' })
  })

  it('Tag instantiates and assigns properties from ITag', () => {
    const tag = new Tag({ name: 'overwatch', type: 'copyright', count: 150 })
    expect(tag.name).toBe('overwatch')
    expect(tag.type).toBe('copyright')
    expect(tag.count).toBe(150)
    expect(tag.toJSON()).toEqual({ name: 'overwatch', type: 'copyright', count: 150 })
  })
})

describe('TagCollection and TagCollectionDTO', () => {
  it('TagCollectionDTO initializes with empty name and tags array', () => {
    const collectionDto = new TagCollectionDTO()
    expect(collectionDto.name).toBe('')
    expect(collectionDto.tags).toEqual([])
  })

  it('TagCollection creates an isolated copy of the tags array', () => {
    const initialTags = ['tag1', 'tag2']
    const collection = new TagCollection({ name: 'Favorites', tags: initialTags })

    expect(collection.name).toBe('Favorites')
    expect(collection.tags).toEqual(['tag1', 'tag2'])

    // Mutating original array does not affect collection
    initialTags.push('tag3')
    expect(collection.tags).toEqual(['tag1', 'tag2'])
  })
})
