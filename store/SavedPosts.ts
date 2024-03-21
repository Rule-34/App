import Dexie, { type Table } from 'dexie'
import type { IPost } from '~/assets/js/post.dto'
import type { BooruObj } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'

// TODO: Delay all activity until website is idle

// By defining the interface of table records,
// you get better type safety and code completion
export interface ISavedPost {
  id?: number // Primary key. Optional (autoincremented)

  original_id: number
  original_domain: BooruObj['domain']

  data: IPost

  /**
   * Unix timestamp
   */
  created_at?: number // Optional. Automatically set when record is created
}

export class SavedPostDatabase extends Dexie {
  posts!: Table<ISavedPost>

  constructor() {
    super('SavedPostDatabase')

    this.version(1).stores({
      // Do not index 'data' because it's not searchable
      posts: '++id, &[original_domain+original_id], created_at'
    })

    this.posts.hook('creating', (primKey, obj, transaction) => {
      obj.created_at = Date.now()
    })
  }
}

export const db = new SavedPostDatabase()
