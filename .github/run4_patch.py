from pathlib import Path

p = Path('lib/everyday-english-clips.ts')
s = p.read_text()

anchor = "const basementYard559: CuratedCollection = {\n"
insert = '''const basementYard351: CuratedCollection = {\n  id: 'english-basement-yard-351-opinions',\n  speakerId: 'joe-santagato-frank-alvarez',\n  speaker: 'Joe Santagato / Frank Alvarez',\n  sourceTitle: \"The Basement Yard #351 · I've Made Love To My Car\",\n  videoId: '3meSp-LahdM',\n  videoTitle: \"I've Made Love To My Car | The Basement Yard #351\",\n  channelName: 'The Basement Yard',\n  thumbnail: 'https://i.ytimg.com/vi/3meSp-LahdM/hqdefault.jpg',\n  duration: 4080,\n  description: 'Queens/NYC conversational English with a direct, natural request for an opinion in the opening exchange.',\n  focus: ['Everyday English', 'NYC', 'Opinions', 'Natural conversation'],\n  status: 'ready',\n  segments: [\n    segment('TBY351-OPINION-01', 5.5, 10.8, \"Opinion · 'What do you think of my drawer?'\"),\n  ],\n}\n\nconst basementYard498: CuratedCollection = {\n  id: 'english-basement-yard-498-agreement',\n  speakerId: 'joe-santagato-frank-alvarez',\n  speaker: 'Joe Santagato / Frank Alvarez',\n  sourceTitle: 'The Basement Yard #498 · The Morning Routine',\n  videoId: 'OELGdBT6o_I',\n  videoTitle: 'The Morning Routine | The Basement Yard #498',\n  channelName: 'The Basement Yard',\n  thumbnail: 'https://i.ytimg.com/vi/OELGdBT6o_I/hqdefault.jpg',\n  duration: 4491,\n  description: \"Natural Queens/NYC turn-taking with a compact exact 'Exactly' agreement response.\",\n  focus: ['Everyday English', 'NYC', 'Agreement', 'Natural conversation'],\n  status: 'ready',\n  segments: [\n    segment('TBY498-AGREE-01', 11.5, 15.0, \"Agreement · 'Yeah, exactly.'\"),\n  ],\n}\n\n'''
if 'const basementYard351:' not in s:
    assert anchor in s
    s = s.replace(anchor, insert + anchor, 1)

old = "  segments: [\n    segment('TBY559-FILL-03-07', 82, 98, \"Conversation fillers · 'to be honest with you ... I mean, listen'\"),\n  ],\n}"
new = "  segments: [\n    segment('TBY559-THANKS-04', 45.0, 56.0, \"Gratitude · 'I really appreciate you inviting me here.'\"),\n    segment('TBY559-FILL-03-07', 82, 98, \"Conversation fillers · 'to be honest with you ... I mean, listen'\"),\n  ],\n}"
if 'TBY559-THANKS-04' not in s:
    assert old in s
    s = s.replace(old, new, 1)

old = "export const EVERYDAY_ENGLISH_COLLECTIONS: CuratedCollection[] = [\n  basementYard339,\n  basementYard446,"
new = "export const EVERYDAY_ENGLISH_COLLECTIONS: CuratedCollection[] = [\n  basementYard339,\n  basementYard351,\n  basementYard446,\n  basementYard498,"
if '  basementYard351,' not in s:
    assert old in s
    s = s.replace(old, new, 1)

anchor = "  {\n    phraseId: 'opinion-08',"
insert = '''  {\n    phraseId: 'opinion-01',\n    collectionId: basementYard351.id,\n    segmentId: 'TBY351-OPINION-01',\n    speaker: 'Joe Santagato',\n    transcript: 'What do you think of my drawer?',\n    matchType: 'exact',\n    evidenceUrl: 'https://www.tapesearch.com/episode/351-i-ve-made-love-to-my-car/SKiuo7T4PXjXsA6qmYaAaH',\n  },\n  {\n    phraseId: 'agree-01',\n    collectionId: basementYard498.id,\n    segmentId: 'TBY498-AGREE-01',\n    speaker: 'Joe Santagato',\n    transcript: 'Yeah, exactly.',\n    matchType: 'exact',\n    evidenceUrl: 'https://pod.wave.co/podcast/the-basement-yard/498-the-morning-routine-c132baa4',\n  },\n  {\n    phraseId: 'thanks-04',\n    collectionId: basementYard559.id,\n    segmentId: 'TBY559-THANKS-04',\n    speaker: 'Frank Alvarez',\n    transcript: 'I really appreciate you inviting me here.',\n    matchType: 'exact',\n    evidenceUrl: 'https://www.audioscrape.com/podcast/the-basement-yard/episode/559-release-the-mosquitos-21020',\n  },\n'''
if "phraseId: 'opinion-01'" not in s:
    assert anchor in s
    s = s.replace(anchor, insert + anchor, 1)
p.write_text(s)

p = Path('docs/EVERYDAY_ENGLISH_CURATION_STATUS.md')
s = p.read_text()
s = s.replace("### 05 Opinions and preferences\n- `opinion-08` I'd rather ... — exact natural preference statement in The Basement Yard #339, YouTube `3f3iKts2u30`, 9.2–15.0s: `I'd rather wear this than get into Formula One racing...`\n- Remaining chapter targets — unmatched / not yet verified.\n\nEvidence for #339: Tapesearch `https://www.tapesearch.com/episode/339-how-to-become-a-priest/hSuGVXn9CNNNDVmFGqToBt`; official YouTube `https://www.youtube.com/watch?v=3f3iKts2u30`.\n\n### 06 Agreeing and disagreeing\nNot yet promoted.\n", "### 05 Opinions and preferences\n- `opinion-01` What do you think? — exact reusable frame in The Basement Yard #351, YouTube `3meSp-LahdM`, 5.5–10.8s: `What do you think of my drawer?`\n- `opinion-08` I'd rather ... — exact natural preference statement in The Basement Yard #339, YouTube `3f3iKts2u30`, 9.2–15.0s: `I'd rather wear this than get into Formula One racing...`\n- Remaining chapter targets — unmatched / not yet verified.\n\nEvidence: #351 Tapesearch `https://www.tapesearch.com/episode/351-i-ve-made-love-to-my-car/SKiuo7T4PXjXsA6qmYaAaH`, official YouTube `https://www.youtube.com/watch?v=3meSp-LahdM`; #339 Tapesearch `https://www.tapesearch.com/episode/339-how-to-become-a-priest/hSuGVXn9CNNNDVmFGqToBt`, official YouTube `https://www.youtube.com/watch?v=3f3iKts2u30`.\n\n### 06 Agreeing and disagreeing\n- `agree-01` Exactly. — exact agreement response `Yeah, exactly.` in The Basement Yard #498, YouTube `OELGdBT6o_I`, 11.5–15.0s.\n- Remaining chapter targets — unmatched / not yet verified.\n\nEvidence for #498: Wave timestamped transcript `https://pod.wave.co/podcast/the-basement-yard/498-the-morning-routine-c132baa4`; official YouTube `https://www.youtube.com/watch?v=OELGdBT6o_I`.\n", 1)
s = s.replace("### 08–13\nNot yet processed in the source-controlled clip corpus. Existing phrase targets remain in `lib/everyday-english.ts`.\n", "### 08 Saying thank you\n- `thanks-04` I really appreciate it. — exact natural gratitude frame in The Basement Yard #559, YouTube `m77sDceykAw`, 45.0–56.0s: `I really appreciate you inviting me here.`\n- Remaining chapter targets — unmatched / not yet verified.\n\nEvidence for #559: Audioscrape `https://www.audioscrape.com/podcast/the-basement-yard/episode/559-release-the-mosquitos-21020`; official YouTube `https://www.youtube.com/watch?v=m77sDceykAw`.\n\n### 09–13\nNot yet promoted in the source-controlled clip corpus. Existing phrase targets remain in `lib/everyday-english.ts`.\n", 1)
s = s.replace('- Verified phrase matches: 12', '- Verified phrase matches: 15', 1)
s = s.replace('- Unique playable source clips: 9', '- Unique playable source clips: 12', 1)
s = s.replace('The Basement Yard #339, #446, #477, #483, #494, #559, #567', 'The Basement Yard #339, #351, #446, #477, #483, #494, #498, #559, #567', 1)
p.write_text(s)
