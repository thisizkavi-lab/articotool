import type { Segment } from './types'
import type { CuratedCollection } from './curated-library'

const segment = (id: string, start: number, end: number, label: string): Segment => ({
  id,
  start,
  end,
  label,
  lines: [],
  createdAt: 0,
})

export const goldnrushMendy116: CuratedCollection = {
  id: 'goldnrush-mendy-116',
  speakerId: 'mandy-sekiguchi',
  speaker: '関口メンディー',
  sourceTitle: 'GOLDNRUSH Ep.116 · 関口メンディー',
  videoId: 'aQ3rPDWuKrI',
  videoTitle: '日本の芸能界で生き残るために。関口メンディーの芸能人生とこれからの挑戦',
  channelName: 'GOLDNRUSH PODCAST',
  thumbnail: 'https://i.ytimg.com/vi/aQ3rPDWuKrI/hqdefault.jpg',
  duration: 3634,
  description: 'Natural long-form Japanese with reflective storytelling, qualification, reframing, casual explanation, and clear opinion-building. Clips are selected from Mendy’s turns rather than the host’s prompts.',
  focus: ['Natural Japanese', 'Storytelling', 'Reframing', 'Explanation', 'Reflection', 'Conversation'],
  status: 'ready',
  segments: [
    segment('GR116-001', 347.30, 368.48, 'Mendy · Qualification · soften a nuanced personal answer'),
    segment('GR116-002', 414.00, 445.36, 'Mendy · Storytelling · teacher reframes identity'),
    segment('GR116-003', 762.24, 796.22, 'Mendy · Casual story · why he started dancing'),
    segment('GR116-004', 1431.27, 1457.67, 'Mendy · Reframing · turn a skill gap into access to teachers'),
    segment('GR116-005', 1457.67, 1493.59, 'Mendy · Comparison · learn strengths, choose another arena'),
    segment('GR116-006', 1631.96, 1655.42, 'Mendy · Adaptation · resistance → acceptance → stronger role'),
    segment('GR116-007', 1752.78, 1780.68, 'Mendy · Nerves · trust professionals and release pressure'),
    segment('GR116-008', 2170.07, 2192.51, 'Mendy · Reflection · lean into your strengths'),
    segment('GR116-009', 2280.67, 2300.75, 'Mendy · Self-correction · overthinking killed the fun'),
    segment('GR116-010', 2322.27, 2352.39, 'Mendy · Explanation · enjoyment aligns audience, team, and self'),
    segment('GR116-011', 2441.32, 2467.24, 'Mendy · Opinion · opportunity versus being chosen'),
    segment('GR116-012', 2803.06, 2818.92, 'Mendy · Explanation · turn character notes into choices'),
    segment('GR116-013', 2857.34, 2879.58, 'Mendy · Aspiration · inhabit a role instead of performing it'),
    segment('GR116-014', 2903.72, 2926.36, 'Mendy · Qualification · gratitude while choosing independence'),
    segment('GR116-015', 3079.32, 3103.10, 'Mendy · Creative rule · make what feels authentic first'),
    segment('GR116-016', 3145.70, 3171.20, 'Mendy · Explanation · use your position to broaden taste'),
    segment('GR116-017', 3217.48, 3242.98, 'Mendy · Creative identity · genreless and borderless'),
    segment('GR116-018', 3269.18, 3297.30, 'Mendy · Ambition · prove independence through results'),
    segment('GR116-019', 3395.98, 3412.32, 'Mendy · Reflection · challenge makes people rally around you'),
    segment('GR116-020', 3427.72, 3446.84, 'Mendy · Purpose · cheering for people creates energy'),
  ],
}

export const GOLDNRUSH_CURATED_COLLECTIONS: CuratedCollection[] = [
  goldnrushMendy116,
]

export function getGoldnrushCollection(id: string | null | undefined): CuratedCollection | null {
  if (!id) return null
  return GOLDNRUSH_CURATED_COLLECTIONS.find(collection => collection.id === id) || null
}
