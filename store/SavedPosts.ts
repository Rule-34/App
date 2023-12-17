import Dexie, { type Table } from 'dexie'
import type { BooruObj } from '~/assets/lib/rule-34-shared-resources/src/util/BooruUtils'
import type { IPost } from '~/assets/js/post'

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

    // Populate with some default posts
    this.on('populate', async () => {
      await this.posts.bulkAdd([
        {
          original_id: 1,

          original_domain: 'safebooru.org',

          data: {
            id: 1,
            score: null,
            high_res_file: {
              url: 'https://safebooru.org/images/1/e7b3dc281d431f7a9f4ab81986d2de9a20d36d2e.jpg',
              width: 1200,
              height: 900
            },
            low_res_file: {
              url: 'https://safebooru.org/samples/1/sample_e7b3dc281d431f7a9f4ab81986d2de9a20d36d2e.jpg',
              width: 850,
              height: 638
            },
            preview_file: {
              url: 'https://safebooru.org/thumbnails/1/thumbnail_e7b3dc281d431f7a9f4ab81986d2de9a20d36d2e.jpg',
              width: 150,
              height: 112
            },
            tags: {
              artist: [],
              character: [],
              copyright: [],
              general: [
                '1girl',
                'bag',
                'black_hair',
                'blue_miniskirt',
                'blue_skirt',
                'blush',
                'bob_cut',
                'bowieknife',
                'breasts',
                'breath',
                'coat',
                'girls',
                'gloves',
                'holding',
                'jacket',
                'landscape',
                'legs',
                'legs_together',
                'miniskirt',
                'mountain',
                'necktie',
                'open_mouth',
                'original',
                'pantyhose',
                'peacoat',
                'pleated_miniskirt',
                'pleated_skirt',
                'purse',
                'scarf',
                'short_hair',
                'skirt',
                'snow',
                'solo',
                'toggles',
                'uniform'
              ],
              meta: []
            },
            sources: ['http://www.pixiv.net/artworks/7824792'],
            rating: 'safe',
            media_type: 'image'
          }
        },
        {
          original_id: 5,

          original_domain: 'gelbooru.com',

          data: {
            id: 5,
            score: 48,
            high_res_file: {
              url: 'https://img3.gelbooru.com/images/b0/b5/b0b53e29fdeb13285591a524f23972d4.gif',
              width: 533,
              height: 800
            },
            low_res_file: {
              url: null,
              width: null,
              height: null
            },
            preview_file: {
              url: 'https://img3.gelbooru.com/thumbnails/b0/b5/thumbnail_b0b53e29fdeb13285591a524f23972d4.jpg',
              width: 166,
              height: 250
            },
            tags: {
              artist: [],
              character: [],
              copyright: [],
              general: [
                '1girl',
                'bare_shoulders',
                'carrot',
                'contrapposto',
                'disgaea',
                'flat_chest',
                'hair_ribbon',
                'harada_takehito',
                'looking_at_viewer',
                'looking_back',
                'nippon_ichi',
                'original',
                'pleinair',
                'pointy_ears',
                'rabbit',
                'ribbon',
                'short_hair',
                'simple_background',
                'smile',
                'solo',
                'speech_bubble',
                'standing',
                'stuffed_animal',
                'stuffed_rabbit',
                'stuffed_toy',
                'sweatdrop',
                'thighhighs',
                'translation_request',
                'usagi-san',
                'white_background',
                'white_thighhighs',
                'zettai_ryouiki'
              ],
              meta: []
            },
            sources: [],
            rating: 'safe',
            media_type: 'image'
          }
        }
      ])
    })
  }
}

export const db = new SavedPostDatabase()
