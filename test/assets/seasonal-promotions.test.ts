import { describe, expect, it } from 'vitest'
import { getActivePromotion } from '../../app/composables/useActivePromotion'

const at = (date: string | number) => getActivePromotion(new Date(date))

describe('seasonal promotion calendar', () => {
  it.each([
    ['2026-10-24T00:00:00Z', '2026-11-01T23:59:59Z', 'halloween', '🎃'],
    // Monday before Thanksgiving through Cyber Monday, which falls in December in 2030
    ['2026-11-23T00:00:00Z', '2026-11-30T23:59:59Z', 'black-friday', '🔥'],
    ['2030-11-25T00:00:00Z', '2030-12-02T23:59:59Z', 'black-friday', '🔥'],
    ['2026-12-15T00:00:00Z', '2026-12-26T23:59:59Z', 'christmas', '🎄'],
    ['2026-12-27T00:00:00Z', '2027-01-03T23:59:59Z', 'new-year', '🥳'], // crosses the year change
    ['2027-02-10T00:00:00Z', '2027-02-15T23:59:59Z', 'valentines', '💝'],
    ['2026-06-01T00:00:00Z', '2026-06-30T23:59:59Z', 'pride', '🏳️‍🌈']
  ])('%s to %s is %s', (start, end, baseId, emoji) => {
    for (const date of [start, end]) {
      expect(at(date)).toMatchObject({ baseId, emoji })
      expect(at(date)?.offers.monthly).toMatch(/^[0-9a-f]{24}$/)
      expect(at(date)?.offers.yearly).toMatch(/^[0-9a-f]{24}$/)
    }

    expect(at(Date.parse(start) - 1000)?.baseId).not.toBe(baseId)
    expect(at(Date.parse(end) + 1000)?.baseId).not.toBe(baseId)
  })

  it.each(['2026-03-15T12:00:00Z', '2026-09-30T12:00:00Z', '2026-12-01T00:00:00Z', '2026-12-14T23:59:59Z'])(
    '%s has no promotion',
    (date) => {
      expect(at(date)).toBeNull()
    }
  )
})
