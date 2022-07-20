import { migrateState } from '../../assets/js/MigrateState'

describe('State migration', () => {
  test('State is upgraded to latest version', () => {
    // Arrange
    const DEFAULT_STATE = {
      version: 0,
      statistics: {
        timesTheAppHasBeenOpened: 0
      },
      booru: {
        history: {
          lastDomainUsed: 'rule34.xxx'
        },
        posts: {
          data: []
        }
      },
      navigation: {
        sideNav: {
          isActive: false
        },
        search: {
          isActive: false
        }
      },
      notifications: {
        notifications: {
          url: 'https://gitcdn.xyz/cdn/AlejandroAkbal/2fe43e0eee40be63d9b2a582b2793cf9/raw/app-notifications.json'
        }
      },
      premium: {},
      url: {},
      user: {
        custom: {
          boorus: [
            {
              domain: 'xbooru.com',
              type: 'gelbooru',
              nsfw: true,
              config: null
            }
          ],
          tagCollections: [
            {
              name: 'Gay blocklist',
              tags: ['-gay', '-gay_sex']
            }
          ],
          savedPosts: [
            {
              id: 'rule34.xxx-1',
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
                tags: ['1girl', 'bag'],
                source: [],
                rating: 'safe',
                media_type: 'image'
              },
              meta_data: {
                booru_domain: 'rule34.xxx',
                created_at: '1997-08-22T21:00:00.000Z'
              }
            }
          ]
        },
        settings: {
          touchGestures: {
            name: 'Touch gestures',
            description:
              'Swiping `left-to-right` will open the navigation menu, and `right-to-left` will open the search menu.',
            value: true,
            defaultValue: true
          }
        }
      }
    }

    // Act
    const MIGRATED_STATE = migrateState(DEFAULT_STATE)

    // Assert
    const EXPECTED_STATE = {
      version: 1,
      statistics: {
        timesTheAppHasBeenOpened: 0
      },
      booru: {
        history: {
          lastDomainUsed: 'rule34.xxx'
        },
        posts: {
          data: []
        }
      },
      navigation: {
        sideNav: {
          isActive: false
        },
        search: {
          isActive: false
        }
      },
      notifications: {
        notifications: {
          url: 'https://gitcdn.xyz/cdn/AlejandroAkbal/2fe43e0eee40be63d9b2a582b2793cf9/raw/app-notifications.json'
        }
      },
      premium: {},
      url: {},
      user: {
        custom: {
          boorus: [
            {
              domain: 'xbooru.com',
              type: 'gelbooru',
              nsfw: true,
              config: null
            }
          ],
          tagCollections: [
            {
              name: 'Gay blocklist',
              tags: ['-gay', '-gay_sex']
            }
          ],
          savedPosts: [
            {
              id: 'rule34.xxx-1',
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
                  character: [],
                  copyright: [],
                  artist: [],
                  general: ['1girl', 'bag'],
                  meta: []
                },
                sources: [],
                rating: 'safe',
                media_type: 'image'
              },
              meta_data: {
                booru_domain: 'rule34.xxx',
                created_at: '1997-08-22T21:00:00.000Z'
              }
            }
          ]
        },
        settings: {
          touchGestures: {
            name: 'Touch gestures',
            description:
              'Swiping `left-to-right` will open the navigation menu, and `right-to-left` will open the search menu.',
            value: true,
            defaultValue: true
          }
        }
      }
    }

    expect(MIGRATED_STATE.version).toBe(1)
    expect(MIGRATED_STATE).toEqual(EXPECTED_STATE)
  })
})
