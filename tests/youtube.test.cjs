const { test } = require('node:test')
const assert = require('node:assert/strict')
const load = require('./load-module.cjs')

function route(fetch) {
  return load('app/api/youtube/route.ts', {}, {
    fetch,
    process: { env: { YOUTUBE_API_KEY: 'synthetic-expired-key' } },
    console: { ...console, error() {} },
  }).GET
}

test('single-video metadata falls back when the configured API key fails', async () => {
  const GET = route(async url => String(url).includes('/oembed')
    ? Response.json({ title: 'Public video', thumbnail_url: 'https://example.com/video.jpg', author_name: 'Speaker' })
    : Response.json({ error: { message: 'API key expired' } }, { status: 400 }))
  const response = await GET(new Request('https://example.com/api/youtube?videoId=3qHkcs3kG44'))
  assert.equal(response.status, 200)
  assert.equal((await response.json()).video.title, 'Public video')
})

test('search failures return an explicit service error rather than empty results', async () => {
  const GET = route(async () => Response.json({ error: { message: 'API key expired' } }, { status: 400 }))
  const response = await GET(new Request('https://example.com/api/youtube?q=hello'))
  assert.equal(response.status, 503)
  assert.match((await response.json()).error, /temporarily unavailable/)
})

test('invalid video IDs are rejected before calling an upstream service', async () => {
  const GET = route(async () => { throw new Error('Must not be called') })
  const response = await GET(new Request('https://example.com/api/youtube?videoId=invalid'))
  assert.equal(response.status, 400)
})
