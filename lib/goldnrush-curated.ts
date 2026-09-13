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

export const GOLDNRUSH_ITO_AWA_137: GoldnrushCuratedCollection = {
  id: 'goldnrush-ito-awa-137',
  speaker: '伊藤亜和',
  sourceTitle: 'GOLDNRUSH Podcast Ep.137',
  videoId: 'FBA7X77QSPI',
  videoTitle: 'ハーフの文筆家として伊藤亜和が今の日本に思うこと。書く人にも二種類いる。GOLDNRUSH PODCAST Ep.137',
  channelName: 'GOLDNRUSH PODCAST',
  thumbnail: 'https://i.ytimg.com/vi/FBA7X77QSPI/hqdefault.jpg',
  duration: 4613,
  description: 'Reflective, contemporary Japanese from writer 伊藤亜和. Selected for thinking aloud, qualification, self-deprecation, nuanced opinion, and explaining how she writes.',
  focus: ['Thinking aloud', 'Qualification', 'Writing', 'Opinion', 'Self-reflection'],
  segments: [
    segment('ITO137-001', 194.96, 206.5, '伊藤亜和 · ストーリー · 書くことは日常の延長だった'),
    segment('ITO137-002', 1557.31, 1583.09, '伊藤亜和 · 意見 · 議論と越えてはいけない線を分ける'),
    segment('ITO137-003', 2808.47, 2817.39, '伊藤亜和 · 書き方 · 書きながら考える'),
    segment('ITO137-004', 2903.01, 2931.59, '伊藤亜和 · 習慣 · 締切の日に書き始める'),
    segment('ITO137-005', 3053.66, 3077.16, '伊藤亜和 · 地に足 · 怒られる場所で自分を見直す'),
    segment('ITO137-006', 4153.12, 4162.32, '伊藤亜和 · 現実感 · 誰にでも触れられたくない部分がある'),
    segment('ITO137-007', 4372.54, 4407.32, '伊藤亜和 · 整理 · 書く人には二種類いる'),
    segment('ITO137-008', 4422.56, 4459.54, '伊藤亜和 · 役割 · 答えよりいろんな人生を提示する'),
  ],
}

export const GOLDNRUSH_ZEEBRA_149: GoldnrushCuratedCollection = {
  id: 'goldnrush-zeebra-149',
  speaker: 'Zeebra',
  sourceTitle: 'GOLDNRUSH Podcast Ep.149',
  videoId: '2mDTZiK4Dug',
  videoTitle: '１度目の結婚でラッパーの道を離れたZeebra。「娘をDJにはやれん」、HIPHOPが理解されなかった時代 GOLDNRUSH PODCAST Ep.149',
  channelName: 'GOLDNRUSH PODCAST',
  thumbnail: 'https://i.ytimg.com/vi/2mDTZiK4Dug/hqdefault.jpg',
  duration: 4627,
  description: 'Articulate Japanese from Zeebra on originality, comparison, creative identity, music, responsibility, and life choices. Selected for clear opinion-building and storytelling.',
  focus: ['Opinion', 'Originality', 'Storytelling', 'Definition', 'Reframing'],
  segments: [
    segment('ZEEBRA149-001', 971.57, 1009.65, 'Zeebra · 定義 · 自分の表現を持つ'),
    segment('ZEEBRA149-002', 1024.07, 1061.85, 'Zeebra · オリジナリティ · 人と違うものを探す'),
    segment('ZEEBRA149-003', 1115.35, 1130.01, 'Zeebra · 比較 · 違う相手を見ると見え方が変わる'),
    segment('ZEEBRA149-004', 1181.47, 1204.77, 'Zeebra · ストーリー · 好きなものが全部つながった'),
    segment('ZEEBRA149-005', 1233.23, 1270.93, 'Zeebra · 自己理解 · 興味を辿ってラップに着く'),
    segment('ZEEBRA149-006', 1840.19, 1857.65, 'Zeebra · 責任 · 父親になる決断を語る'),
    segment('ZEEBRA149-007', 1932.83, 1953.35, 'Zeebra · 転機 · 夢を止めても自分の軸は残す'),
  ],
}

export const GOLDNRUSH_SARASA_154: GoldnrushCuratedCollection = {
  id: 'goldnrush-sarasa-154',
  speaker: 'さらさ',
  sourceTitle: 'GOLDNRUSH Podcast Ep.154',
  videoId: 'hTvGxeAMOuU',
  videoTitle: '自然体に見える人ほど意識している、さらさが語る美学が変わっていった理由と本音 GOLDNRUSH PODCAST Ep.154',
  channelName: 'GOLDNRUSH PODCAST',
  thumbnail: 'https://i.ytimg.com/vi/hTvGxeAMOuU/hqdefault.jpg',
  duration: 3528,
  description: 'Young contemporary Japanese from さらさ, with strong introspection, emotional precision, problem-solving language, values, and relaxed creative explanation.',
  focus: ['Introspection', 'Emotion', 'Values', 'Problem-solving', 'Creative explanation'],
  segments: [
    segment('SARASA154-001', 368.86, 382.76, 'さらさ · 内省 · 自分のネガティブな感情を言葉にする'),
    segment('SARASA154-002', 386.14, 419.6, 'さらさ · リフレーミング · ネガティブな経験を転機として振り返る'),
    segment('SARASA154-003', 1480.6, 1512.52, 'さらさ · 自己理解 · 歌いたい本音に気づく'),
    segment('SARASA154-004', 1514.84, 1532.56, 'さらさ · 説明 · 音楽は体に流れている'),
    segment('SARASA154-005', 1908.22, 1928.22, 'さらさ · 感情 · 評価されることが怖かった'),
    segment('SARASA154-006', 1974.82, 1988.72, 'さらさ · 正直さ · 評価と実力のギャップ'),
    segment('SARASA154-007', 1999.7, 2037.34, 'さらさ · 問題解決 · 「じゃあどうしよう」に切り替える'),
    segment('SARASA154-008', 2486.54, 2513.18, 'さらさ · 価値観 · 自分のYES / NOをはっきり持つ'),
    segment('SARASA154-009', 2513.72, 2546.32, 'さらさ · 自分らしさ · 何かになろうとしない'),
    segment('SARASA154-010', 2953.22, 2978.18, 'さらさ · 内省 · 心の余裕を取り戻す'),
    segment('SARASA154-011', 3126.04, 3153.92, 'さらさ · 説明 · 実験できる場を作る'),
  ],
}

export const GOLDNRUSH_SHIGEKIX_106: GoldnrushCuratedCollection = {
  id: 'goldnrush-shigekix',
  speaker: 'Shigekix',
  sourceTitle: 'GOLDNRUSH Podcast Ep.106',
  videoId: 'pN7VRUwrXn0',
  videoTitle: '命名は先輩の遊び半分！？今大活躍のB-Boy Shigekixのオリジンストーリーとアーティストとしてのキャリア GOLDNRUSH PODCAST Ep.106',
  channelName: 'GOLDNRUSH PODCAST',
  thumbnail: 'https://i.ytimg.com/vi/pN7VRUwrXn0/hqdefault.jpg',
  duration: 3217,
  description: 'Energetic but thoughtful Japanese from Shigekix on growth, originality, expression, community, challenge, and becoming a source of motivation for other people.',
  focus: ['Storytelling', 'Originality', 'Explanation', 'Challenge', 'Motivation'],
  segments: [
    segment('SHIGEKIX106-001', 359.56, 389.08, 'Shigekix · 成長 · 気づけば世界に届いていた'),
    segment('SHIGEKIX106-002', 467.48, 481.14, 'Shigekix · ストーリー · 一本の動画で世界に届く'),
    segment('SHIGEKIX106-003', 1090.78, 1120.68, 'Shigekix · 期待 · コミュニティ同士が交わる'),
    segment('SHIGEKIX106-004', 1560.46, 1587.26, 'Shigekix · 説明 · 技術と音楽性を分けて考える'),
    segment('SHIGEKIX106-005', 1587.96, 1610.58, 'Shigekix · オリジナリティ · 唯一無二を作る'),
    segment('SHIGEKIX106-006', 2090.28, 2108.24, 'Shigekix · 表現 · パッションをアウトプットする'),
    segment('SHIGEKIX106-007', 2132.68, 2144.68, 'Shigekix · 自己理解 · シャイな自分に出口ができた'),
    segment('SHIGEKIX106-008', 2440.4, 2470.24, 'Shigekix · 目的 · 誰かの心の支えや居場所になる'),
    segment('SHIGEKIX106-009', 3027.98, 3062.68, 'Shigekix · 挑戦 · 失敗も含めて面白くなる'),
    segment('SHIGEKIX106-010', 3078.16, 3108.66, 'Shigekix · モチベーション · 誰かの明日の活力になる'),
    segment('SHIGEKIX106-011', 3137.44, 3152.94, 'Shigekix · 視点 · 挑戦は自分だけのためじゃない'),
  ],
}

export const GOLDNRUSH_NISHIDA_110: GoldnrushCuratedCollection = {
  id: 'goldnrush-nishida-yuji',
  speaker: '西田有志',
  sourceTitle: 'GOLDNRUSH Podcast Ep.110',
  videoId: '5eCWPY7k0Z4',
  videoTitle: '適当にやるくらいが1番ちょうどいい。バレーボール日本代表エース西田有志が語る何事も上手くなる方法、YouTubeそして結婚生活について',
  channelName: 'GOLDNRUSH PODCAST',
  thumbnail: 'https://i.ytimg.com/vi/5eCWPY7k0Z4/hqdefault.jpg',
  duration: 4122,
  description: 'Direct, practical Japanese from 西田有志 on learning, feedback, team dynamics, motivation, practice, effort, and keeping a healthy distance from pressure.',
  focus: ['Directness', 'Learning', 'Feedback', 'Teamwork', 'Motivation', 'Effort'],
  segments: [
    segment('NISHIDA110-001', 1243.44, 1251.48, '西田有志 · 価値観 · 先より目の前の面白さ'),
    segment('NISHIDA110-002', 1488, 1517.52, '西田有志 · 学び方 · 必要だから聞いて話せるようになる'),
    segment('NISHIDA110-003', 3339.74, 3359.14, '西田有志 · フィードバック · ダメ出しより具体的な提案'),
    segment('NISHIDA110-004', 3488.28, 3513.22, '西田有志 · メンタル · 勝ちだけを追うと崩れやすい'),
    segment('NISHIDA110-005', 3526.66, 3541.8, '西田有志 · リフレーミング · 楽しんで勝つ'),
    segment('NISHIDA110-006', 3542.28, 3566.14, '西田有志 · チーム · 人それぞれの動機を合わせる'),
    segment('NISHIDA110-007', 3590.34, 3607.56, '西田有志 · 距離感 · ちょっと適当なくらいがいい'),
    segment('NISHIDA110-008', 3621.44, 3637.58, '西田有志 · 練習 · 自由に試すための土台を作る'),
    segment('NISHIDA110-009', 3732.98, 3759.86, '西田有志 · 動機 · うまくなりたいと楽しいをつなぐ'),
    segment('NISHIDA110-010', 3825.16, 3839.5, '西田有志 · 努力 · いやいややっても伸びない'),
    segment('NISHIDA110-011', 3851.64, 3875.92, '西田有志 · チーム · 感情を押し付けない'),
    segment('NISHIDA110-012', 3876.68, 3895.42, '西田有志 · サイクル · 好きだから努力が続く'),
    segment('NISHIDA110-013', 3950.3, 3965.4, '西田有志 · メリハリ · やる時と休む時を分ける'),
    segment('NISHIDA110-014', 3966.36, 3998.52, '西田有志 · 努力 · 才能より積み重ねる'),
  ],
}

export const GOLDNRUSH_CURATED_COLLECTIONS: GoldnrushCuratedCollection[] = [
  GOLDNRUSH_MENDY_116,
  GOLDNRUSH_ITO_AWA_137,
  GOLDNRUSH_ZEEBRA_149,
  GOLDNRUSH_SARASA_154,
  GOLDNRUSH_SHIGEKIX_106,
  GOLDNRUSH_NISHIDA_110,
]

export function getGoldnrushCollection(id: string | null | undefined): GoldnrushCuratedCollection | null {
  if (!id) return null
  return GOLDNRUSH_CURATED_COLLECTIONS.find(collection => collection.id === id) || null
}
