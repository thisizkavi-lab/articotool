import type { Segment } from './types'

export interface GoldnrushCuratedCollection {
  id: string
  videoId: string
  speaker: string
  segments: Segment[]
}

const segment = (id: string, start: number, end: number, label: string): Segment => ({
  id,
  start,
  end,
  label,
  lines: [],
  createdAt: 0,
})

const mendy116: GoldnrushCuratedCollection = {
  id: 'goldnrush-mendy-116',
  videoId: 'aQ3rPDWuKrI',
  speaker: '関口メンディー',
  segments: [
    segment('MENDY116-001', 1403.3, 1423.54, 'Mendy · Reframing · comparing yourself with others'),
    segment('MENDY116-002', 1443.42, 1468.9, 'Mendy · Reframing · turn a disadvantage into a good environment'),
    segment('MENDY116-003', 1471.52, 1512.12, 'Mendy · Explanation · find a different role instead of copying others'),
    segment('MENDY116-004', 1541.86, 1561.76, 'Mendy · Strategy · choose a different lane instead of competing head-on'),
    segment('MENDY116-005', 2153.6, 2192.5, 'Mendy · Self-reflection · accept different sides of yourself and use your strengths'),
    segment('MENDY116-006', 2220.9, 2233.0, 'Mendy · Advice · start by enjoying what you are good at'),
    segment('MENDY116-007', 2278.1, 2300.7, 'Mendy · Reflection · overthinking can erase your strengths'),
    segment('MENDY116-008', 2308.5, 2321.8, 'Mendy · Observation · people gather around someone genuinely enjoying themselves'),
    segment('MENDY116-009', 2322.3, 2350.3, 'Mendy · Explanation · enjoying the work creates a better atmosphere for everyone'),
    segment('MENDY116-010', 2455.5, 2466.6, 'Mendy · Distinction · wanting an opportunity vs being chosen for it'),
    segment('MENDY116-011', 2473.5, 2506.2, 'Mendy · Reframing · difference is what makes someone interesting'),
    segment('MENDY116-012', 2660.8, 2700.1, 'Mendy · Explanation · acting requires imagining the person behind the role'),
    segment('MENDY116-013', 2772.5, 2823.4, 'Mendy · Method · build a character from clues and write the logic down'),
    segment('MENDY116-014', 2904.1, 2943.4, 'Mendy · Self-reflection · gratitude can coexist with the need to stand on your own'),
    segment('MENDY116-015', 3045.4, 3097.4, 'Mendy · Creativity · do not dilute your individuality by forcing yourself into a mold'),
    segment('MENDY116-016', 3427.3, 3447.0, 'Mendy · Motivation · someone else’s challenge can create energy for other people'),
  ],
}

const GOLDNRUSH_COLLECTIONS: GoldnrushCuratedCollection[] = [mendy116]

export function getGoldnrushCollection(id: string | null | undefined): GoldnrushCuratedCollection | null {
  if (!id) return null
  return GOLDNRUSH_COLLECTIONS.find(collection => collection.id === id) || null
}
