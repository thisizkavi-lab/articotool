import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const LOG_FILE = path.join(process.cwd(), 'youtube-debug.log')
function debugLog(message: string) {
  const timestamp = new Date().toISOString()
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`)
  console.log(message)
}

interface TranscriptSegment {
  text: string
  start: number
  duration: number
}

async function fetchTranscriptManual(videoId: string): Promise<TranscriptSegment[]> {
  debugLog(`[Transcript Debug] Manually fetching transcript for ${videoId}`)

  const baseHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  }

  try {
    let response = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`, {
      headers: baseHeaders,
    })
    let html = await response.text()
    let setCookie = response.headers.get('set-cookie') || ''



    debugLog(`[Transcript Debug] HTML length: ${html.length}, Cookie length: ${setCookie.length}`)

    // Strategy 1: Signed URL from Player Response
    let playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({[\s\S]+?})\s*;/);
    if (!playerResponseMatch) {
      playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({[\s\S]+?})\s*;/);
    }
    if (!playerResponseMatch) {
      playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({[\s\S]+?})\s*<\//);
    }
    if (!playerResponseMatch) {
      playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({[\s\S]+?})\s*[\n\r]/);
    }

    // As a backup, search for the key structure if variable assignment is missing
    if (!playerResponseMatch) {
      const jsonMatch = html.match(/{"responseContext":.*?}+/);
      if (jsonMatch && jsonMatch[0].includes("playerCaptionsTracklistRenderer")) {
        playerResponseMatch = jsonMatch;
      }
    }

    // Check if we found captions in the initial match
    let hasCaptions = false;
    if (playerResponseMatch) {
      try {
        const tempJson = JSON.parse(playerResponseMatch[1]);
        if (tempJson?.captions?.playerCaptionsTracklistRenderer?.captionTracks?.length > 0) {
          hasCaptions = true;
        }
      } catch (e) { }
    }

    // Fallback: Try Embed Page if Watch Page parsing failed OR no captions found
    if (!playerResponseMatch || !hasCaptions) {
      debugLog(`[Transcript Debug] Watch page parsing failed. Fetching Embed page...`)
      try {
        const embedResponse = await fetch(`https://www.youtube.com/embed/${videoId}`, { headers: baseHeaders })
        const embedHtml = await embedResponse.text()
        const embedCookie = embedResponse.headers.get('set-cookie') || ''

        // Update context if embed works
        if (embedHtml.length > 5000) {
          let embedMatch = embedHtml.match(/ytInitialPlayerResponse\s*=\s*({[\s\S]+?})\s*;/);
          if (!embedMatch) embedMatch = embedHtml.match(/ytInitialPlayerResponse\s*=\s*({[\s\S]+?})\s*<\//);

          if (embedMatch) {
            debugLog(`[Transcript Debug] Found playerResponse in Embed page`)
            playerResponseMatch = embedMatch
            html = embedHtml
            setCookie = embedCookie || setCookie
          } else {
            // Try searching for config object in embed (Legacy)
            const configMatch = embedHtml.match(/yt\.setConfig\({'PLAYER_CONFIG':\s*({[\s\S]+?})\s*}\);/);
            if (configMatch) {
              try {
                const config = JSON.parse(configMatch[1])
                const embeddedResponse = config.args?.embedded_player_response || config.args?.player_response
                if (embeddedResponse) {
                  // Synthesize a match structure
                  playerResponseMatch = [JSON.stringify(typeof embeddedResponse === 'string' ? JSON.parse(embeddedResponse) : embeddedResponse), typeof embeddedResponse === 'string' ? embeddedResponse : JSON.stringify(embeddedResponse)];
                  html = embedHtml
                }
              } catch (e) { }
            }
          }
        }
      } catch (e) { debugLog(`[Transcript Debug] Embed fetch failed: ${e}`) }
    }

    if (playerResponseMatch) {
      try {
        const playerResponse = JSON.parse(playerResponseMatch[1]!)
        const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || []
        debugLog(`[Transcript Debug] Found ${captionTracks.length} signed tracks`)

        if (captionTracks.length === 0) {
          debugLog(`[Transcript Debug] playerResponse keys: ${Object.keys(playerResponse).join(', ')}`)
          if (playerResponse.captions) {
            debugLog(`[Transcript Debug] playerResponse.captions keys: ${Object.keys(playerResponse.captions).join(', ')}`)
          }
          if (playerResponse.playabilityStatus) {
            debugLog(`[Transcript Debug] playabilityStatus: ${JSON.stringify(playerResponse.playabilityStatus)}`)
          }
        }

        // Prioritize English
        const tracks = captionTracks.filter((t: any) => t.languageCode === 'en' || t.languageCode.startsWith('en'))
        if (tracks.length === 0 && captionTracks.length > 0) tracks.push(captionTracks[0])

        for (const track of tracks) {
          const urls = [
            track.baseUrl + '&fmt=json3',
            track.baseUrl
          ]
          for (const url of urls) {
            debugLog(`[Transcript Debug] Trying Strategy 1 (Signed URL): ${url.slice(0, 80)}...`)
            const response = await fetch(url, {
              headers: {
                'User-Agent': baseHeaders['User-Agent'],
                'Referer': `https://www.youtube.com/watch?v=${videoId}`,
              }
            })
            if (response.ok) {
              const text = await response.text()
              const segments = parseTimedtextResponse(text)
              if (segments.length > 0) {
                debugLog(`[Transcript Debug] Strategy 1 SUCCESS (${segments.length} segments)`)
                return segments
              } else {
                debugLog(`[Transcript Debug] Strategy 1 fetched but parsed 0 segments. Text length: ${text.length}`)
              }
            } else {
              debugLog(`[Transcript Debug] Strategy 1 failed: ${response.status}`)
            }
          }
        }
      } catch (e) {
        debugLog(`[Transcript Debug] Strategy 1 error: ${e}`)
      }
    } else {
      debugLog(`[Transcript Debug] ytInitialPlayerResponse NOT FOUND in HTML`)
    }

    // Strategy 2: Innertube (Unified)
    const apiKeyMatch = html.match(/"innertubeApiKey":"([^"]+)"/) || html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)
    const apiKey = apiKeyMatch?.[1]
    const visitorDataMatch = html.match(/"visitorData":"([^"]+)"/)
    const visitorData = visitorDataMatch?.[1] || ''
    const clientVersionMatch = html.match(/"clientVersion":"([\d.]+)"/) || html.match(/"INNERTUBE_CONTEXT_CLIENT_VERSION":"([^"]+)"/)
    const clientVersion = clientVersionMatch?.[1] || '2.20240722.00.00'

    debugLog(`[Transcript Debug] API Key found: ${!!apiKey}, Visitor Data found: ${!!visitorData}, Client Version: ${clientVersion}`)

    const initialDataMatch = html.match(/ytInitialData\s*=\s*({[\s\S]*?});/)
    debugLog(`[Transcript Debug] ytInitialData found: ${!!initialDataMatch}`)

    let transcriptParams: string | null = null
    if (initialDataMatch) {
      try {
        const initialData = JSON.parse(initialDataMatch[1]!)
        const findParams = (obj: any): void => {
          if (!obj || typeof obj !== 'object' || transcriptParams) return
          if (obj.getTranscriptEndpoint?.params) {
            transcriptParams = obj.getTranscriptEndpoint.params
            debugLog(`[Transcript Debug] Found transcriptParams: ${transcriptParams.slice(0, 20)}...`)
          }
          for (const key in obj) findParams(obj[key])
        }
        findParams(initialData)
      } catch (e) {
        debugLog(`[Transcript Debug] Error parsing ytInitialData: ${e}`)
      }
    }

    if (apiKey && transcriptParams) {
      debugLog(`[Transcript Debug] Found API Key and Params. Trying Strategy 2 (Innertube)`)
      const clients = [
        { name: 'WEB', clientName: 'WEB', clientVersion: clientVersion, ua: baseHeaders['User-Agent'] },
        { name: 'MWEB', clientName: 'MWEB', clientVersion: '2.20240722.05.00', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' }
      ]

      const params = transcriptParams;
      for (const client of clients) {
        try {
          debugLog(`[Transcript Debug] Trying Innertube ${client.name} client`)
          const response = await fetch(`https://www.youtube.com/youtubei/v1/get_transcript?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': client.ua,
              'X-Youtube-Client-Name': client.clientName,
              'X-Youtube-Client-Version': client.clientVersion,
              'X-Goog-Visitor-Id': visitorData
            },
            body: JSON.stringify({
              context: {
                client: {
                  hl: 'en',
                  gl: 'US',
                  visitorData,
                  clientName: client.name,
                  clientVersion: client.clientVersion
                }
              },
              params: params
            })
          })
          if (response.ok) {
            const json = await response.json()
            const segments = parseInnertubeResponse(json)
            if (segments.length > 0) {
              debugLog(`[Transcript Debug] Strategy 2 SUCCESS via ${client.name} (${segments.length} segments)`)
              return segments
            }
          } else {
            const errorText = await response.text()
            debugLog(`[Transcript Debug] Innertube ${client.name} failed (${response.status}): ${errorText.slice(0, 100)}`)
          }
        } catch (e) { }
      }
    }

    // Strategy 5: Innertube Android Next (Fresh params)
    if (apiKey) {
      debugLog(`[Transcript Debug] Strategy 5: Fetching fresh params via Innertube Android Next`)
      try {
        const androidClient = {
          clientName: 'ANDROID',
          clientVersion: '19.29.1',
          ua: 'com.google.android.youtube/19.29.1 (Linux; U; Android 14; en_US; Google Pixel 8)'
        }
        // 1. Fetch Next endpoint
        const nextResponse = await fetch(`https://www.youtube.com/youtubei/v1/next?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': androidClient.ua,
            'X-Youtube-Client-Name': '3',
            'X-Youtube-Client-Version': androidClient.clientVersion,
          },
          body: JSON.stringify({
            context: {
              client: {
                hl: 'en',
                gl: 'US',
                clientName: androidClient.clientName,
                clientVersion: androidClient.clientVersion,
                androidSdkVersion: 34
              }
            },
            videoId: videoId
          })
        })

        if (nextResponse.ok) {
          const nextJson = await nextResponse.json()
          let freshParams = null

          // Deep search for getTranscriptEndpoint
          const findParams = (obj: any): void => {
            if (!obj || typeof obj !== 'object' || freshParams) return
            if (obj.getTranscriptEndpoint?.params) {
              freshParams = obj.getTranscriptEndpoint.params
            }
            for (const key in obj) findParams(obj[key])
          }
          findParams(nextJson)

          if (freshParams) {
            debugLog(`[Transcript Debug] Strategy 5: Found fresh params. Fetching transcript...`)
            const transResponse = await fetch(`https://www.youtube.com/youtubei/v1/get_transcript?key=${apiKey}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': androidClient.ua,
                'X-Youtube-Client-Name': '3',
                'X-Youtube-Client-Version': androidClient.clientVersion,
              },
              body: JSON.stringify({
                context: {
                  client: {
                    hl: 'en',
                    gl: 'US',
                    clientName: androidClient.clientName,
                    clientVersion: androidClient.clientVersion,
                    androidSdkVersion: 34
                  }
                },
                params: freshParams
              })
            })

            if (transResponse.ok) {
              const json = await transResponse.json()
              const segments = parseInnertubeResponse(json)
              if (segments.length > 0) {
                debugLog(`[Transcript Debug] Strategy 5 SUCCESS (${segments.length} segments)`)
                return segments
              }
            } else {
              debugLog(`[Transcript Debug] Strategy 5 get_transcript failed: ${transResponse.status}`)
            }
          } else {
            debugLog(`[Transcript Debug] Strategy 5: No transcript params found in next response`)
          }
        } else {
          debugLog(`[Transcript Debug] Strategy 5 next request failed: ${nextResponse.status}`)
        }
      } catch (e) { debugLog(`[Transcript Debug] Strategy 5 error: ${e}`) }
    }


    // Strategy 3: Timedtext Guessing Fallback
    debugLog(`[Transcript Debug] Strategy 3: Timedtext Guessing`)
    const guesses = [
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`,
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&kind=asr&fmt=json3`,
      `https://video.google.com/timedtext?v=${videoId}&lang=en&fmt=json3`
    ]
    for (const url of guesses) {
      try {
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
        if (response.ok) {
          const text = await response.text()
          const segments = parseTimedtextResponse(text)
          if (segments.length > 0) {
            debugLog(`[Transcript Debug] Strategy 3 SUCCESS (${segments.length} segments)`)
            return segments
          }
        }
      } catch (e) { }
    }

    // Strategy 4: Embed Trick
    debugLog(`[Transcript Debug] Strategy 4: Embed Trick`)
    try {
      const embedResponse = await fetch(`https://www.youtube.com/embed/${videoId}`, { headers: baseHeaders })
      const embedHtml = await embedResponse.text()
      const embedDataMatch = embedHtml.match(/ytInitialPlayerResponse\s*=\s*({[\s\S]*?});/)
      if (embedDataMatch) {
        const playerResponse = JSON.parse(embedDataMatch[1]!)
        const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || []
        if (captionTracks.length > 0) {
          const url = captionTracks[0].baseUrl + '&fmt=json3'
          const res = await fetch(url)
          if (res.ok) {
            const text = await res.text()
            const segments = parseTimedtextResponse(text)
            if (segments.length > 0) {
              debugLog(`[Transcript Debug] Strategy 4 SUCCESS (${segments.length} segments)`)
              return segments
            }
          }
        }
      }
    } catch (e) { }

    debugLog(`[Transcript Debug] ALL STRATEGIES FAILED for ${videoId}`)
    return []
  } catch (error) {
    debugLog(`[Transcript Debug] fetchTranscriptManual FATAL ERROR: ${error}`)
    return []
  }
}

function parseInnertubeResponse(json: any): TranscriptSegment[] {
  const segments: TranscriptSegment[] = []
  const actions = json.actions || []
  let transcriptRenderer = null

  for (const action of actions) {
    if (action.updateEngagementPanelAction) {
      transcriptRenderer = action.updateEngagementPanelAction.content?.transcriptRenderer
    } else if (action.showTranscriptAction) {
      transcriptRenderer = action.showTranscriptAction.panelContent?.transcriptRenderer
    }
  }
  if (!transcriptRenderer) transcriptRenderer = json.content?.transcriptRenderer

  const cueGroups = transcriptRenderer?.body?.transcriptBodyRenderer?.cueGroups || []
  for (const group of cueGroups) {
    const cue = group.transcriptCueGroupRenderer?.cues?.[0]?.transcriptCueRenderer
    if (cue) {
      segments.push({
        text: (cue.label?.simpleText || cue.label?.runs?.[0]?.text || '').trim(),
        start: parseInt(cue.startOffsetMs) / 1000,
        duration: parseInt(cue.durationMs || '0') / 1000,
      })
    }
  }
  return segments
}

function parseTimedtextResponse(text: string): TranscriptSegment[] {
  if (!text || text.length < 10) return []
  try {
    const data = JSON.parse(text)
    if (data.events) {
      return data.events
        .filter((event: any) => event.segs)
        .map((event: any) => ({
          text: event.segs.map((s: any) => s.utf8).join('').trim(),
          start: (event.tStartMs || 0) / 1000,
          duration: (event.dDurationMs || 0) / 1000
        }))
        .filter((seg: any) => seg.text.length > 0)
    }
  } catch (e) {
    const segments: TranscriptSegment[] = []
    const regex = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g
    let match
    while ((match = regex.exec(text)) !== null) {
      segments.push({
        text: match[3].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim(),
        start: parseFloat(match[1]!),
        duration: parseFloat(match[2]!)
      })
    }
    return segments
  }
  return []
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('videoId')

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
  }

  let title = 'Individual Video'
  try {
    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`
    const oembedResponse = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`,
      { cache: 'no-store' }
    )
    if (oembedResponse.ok) {
      const oembedData = await oembedResponse.json()
      title = oembedData.title || title
    }
  } catch (e) { }

  try {
    const transcript = await fetchTranscriptManual(videoId)
    if (transcript.length === 0) {
      return NextResponse.json({ error: 'No transcript found', transcript: [], title }, { status: 200 })
    }
    return NextResponse.json({ transcript, title })
  } catch (e) {
    return NextResponse.json({ error: 'Error fetching transcript', transcript: [], title }, { status: 200 })
  }
}
