import type { Segment } from './types'

export interface GoldnrushCuratedCollection {
  id: string
  speaker: string
  sourceTitle: string
  videoId: string
  videoTitle: string
  channelName: string
  thumbnail: string
  duration: number
  description: string
  focus: string[]
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

export const GOLDNRUSH_MENDY_116: GoldnrushCuratedCollection = {
  id: 'goldnrush-mendy-116',
  speaker: '関口メンディー',
  sourceTitle: 'GOLDNRUSH Podcast Ep.116',
  videoId: 'aQ3rPDWuKrI',
  videoTitle: '日本の芸能界で生き残るために。関口メンディーの芸能人生とこれからの挑戦 GOLDNRUSH PODCAST Ep.116',
  channelName: 'GOLDNRUSH PODCAST',
  thumbnail: 'https://i.ytimg.com/vi/aQ3rPDWuKrI/hqdefault.jpg',
  duration: 3634,
  description: 'Natural contemporary Japanese from 関口メンディー, selected for reusable conversational phrasing, reframing, explanation, self-reflection, and calm answer structure.',
  focus: ['Natural Japanese', 'Reframing', 'Explanation', 'Self-reflection', 'Answer structure'],
  segments: [
    segment('MENDY116-001', 1403.3, 1423.54, 'Mendy · 比較して落ち込む時の言い方'),
    segment('MENDY116-002', 1443.42, 1468.9, 'Mendy · 見方を変えて学習環境にする'),
    segment('MENDY116-003', 1636.16, 1651.44, 'Mendy · 受け取り方を変える'),
    segment('MENDY116-004', 2170.59, 2192.53, 'Mendy · 自分の強みを生かす'),
    segment('MENDY116-005', 2290.59, 2313.27, 'Mendy · まず自分が楽しむ'),
    segment('MENDY116-006', 2315.49, 2339.69, 'Mendy · 楽しんでいる人に人が集まる'),
    segment('MENDY116-007', 2339.69, 2358.15, 'Mendy · 考えすぎず楽しむ'),
    segment('MENDY116-008', 2474.93, 2512.44, 'Mendy · 人と違うから面白い'),
    segment('MENDY116-009', 2674.45, 2700.13, 'Mendy · 想像して説明する'),
    segment('MENDY116-010', 2772.51, 2799.51, 'Mendy · 自分のやり方を具体的に説明する'),
    segment('MENDY116-011', 2843.35, 2875.77, 'Mendy · 理想の状態を説明する'),
    segment('MENDY116-012', 2904.13, 2926.25, 'Mendy · 恵まれた環境に甘えない'),
    segment('MENDY116-013', 2928.85, 2943.39, 'Mendy · 自分の足で立つ'),
    segment('MENDY116-014', 3064.18, 3095.44, 'Mendy · 何かに寄せると個性が薄まる'),
    segment('MENDY116-015', 3210.36, 3242.96, 'Mendy · ジャンルレス・ボーダレス'),
    segment('MENDY116-016', 3359.1, 3378.9, 'Mendy · 笑われてもやりたい'),
  ],
}

export const GOLDNRUSH_CURATED_COLLECTIONS: GoldnrushCuratedCollection[] = [GOLDNRUSH_MENDY_116]

export function getGoldnrushCollection(id: string | null | undefined): GoldnrushCuratedCollection | null {
  if (!id) return null
  return GOLDNRUSH_CURATED_COLLECTIONS.find(collection => collection.id === id) || null
}
