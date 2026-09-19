require('fake-indexeddb/auto')
const { test, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const { clear } = require('idb-keyval')
const load = require('./load-module.cjs')
const { StorageService } = load('lib/storage.ts')
const tick = () => new Promise(resolve => setImmediate(resolve))
const segment = { id: 'clip-a', start: 1, end: 5, label: 'Saved segment', lines: [], createdAt: 1 }

beforeEach(async () => { await clear() })

function makeStore(user = null, overrides = {}) {
  const cloudCalls = []
  const SessionService = {
    findSession: async id => `cloud-${id}`,
    createSession: async id => `cloud-${id}`,
    getLastSession: async () => null,
    getSegments: async () => [],
    syncSession: async (id, segments) => { cloudCalls.push({ id, segments }); return true },
    ...overrides,
  }
  const { useAppStore } = load('lib/store.ts', {
    './storage': { StorageService },
    '@/utils/supabase/client': { createClient: () => ({ auth: { getUser: async () => ({ data: { user } }) } }) },
    '@/lib/services/session-service': { SessionService },
    '@/lib/services/audio-service': { AudioService: {} },
  }, { fetch: async url => ({ ok: true, json: async () => url.includes('/api/youtube') ? { video: { title: 'Loaded video' } } : { transcript: [] } }) })
  return { store: useAppStore, cloudCalls }
}

test('switching videos preserves outgoing segments and isolates notes', async () => {
  const { store } = makeStore()
  store.setState({ videoId: 'video-a', videoTitle: 'Video A', segments: [segment], notes: 'Only for A' })
  await store.getState().loadVideo('video-b')
  await tick()
  const savedA = await StorageService.getSession('video-a')
  assert.equal(savedA.segments.length, 1)
  assert.equal(savedA.notes, 'Only for A')
  assert.equal(store.getState().segments.length, 0)
  assert.equal(store.getState().notes, '')
  await store.getState().loadVideo('video-a')
  assert.equal(store.getState().segments[0].id, 'clip-a')
  assert.equal(store.getState().notes, 'Only for A')
})

test('saved take bytes survive a fresh storage read, and deletion is durable', async () => {
  const { store } = makeStore()
  store.setState({ videoId: 'video-a', segments: [segment] })
  const blobUrl = URL.createObjectURL(new Blob(['synthetic audio'], { type: 'audio/webm' }))
  await store.getState().addRecording({ id: 'take-1', segmentId: 'clip-a', blobUrl, type: 'audio', createdAt: 1 })
  const restored = await StorageService.getAllRecordings()
  assert.equal(restored.length, 1)
  assert.equal(await (await fetch(restored[0].blobUrl)).text(), 'synthetic audio')
  URL.revokeObjectURL(restored[0].blobUrl)
  await store.getState().removeRecording('take-1')
  assert.equal((await StorageService.getAllRecordings()).length, 0)
})

test('failed recording persistence never reports a saved take', async () => {
  const { store } = makeStore()
  await assert.rejects(store.getState().addRecording({ id: 'bad-take', segmentId: 'clip-a', blobUrl: 'blob:missing', type: 'audio', createdAt: 1 }))
  assert.equal(store.getState().recordings.length, 0)
  await assert.rejects(store.getState().addRecording({ id: 'empty-take', segmentId: 'clip-a', blobUrl: '', type: 'audio', createdAt: 1 }))
  assert.equal(store.getState().recordings.length, 0)
})

test('library recordings restore only in their own group and video', async () => {
  const blobUrl = URL.createObjectURL(new Blob(['library audio'], { type: 'audio/webm' }))
  await StorageService.saveRecording({ id: 'library-take', segmentId: 'clip-a', videoId: 'video-a', groupId: 'group-a', blobUrl, type: 'audio', createdAt: 1 })
  URL.revokeObjectURL(blobUrl)
  assert.equal((await StorageService.getRecordingsForVideo('video-a', [], 'group-b')).length, 0)
  const restored = await StorageService.getRecordingsForVideo('video-a', [], 'group-a')
  assert.equal(restored.length, 1)
  restored.forEach(recording => URL.revokeObjectURL(recording.blobUrl))
})

test('switching authenticated videos never syncs incoming clips into the old session', async () => {
  const user = { id: 'test-user' }
  const { store, cloudCalls } = makeStore(user)
  store.setState({ user, authInitialized: true, videoId: 'video-a', cloudSessionId: 'cloud-video-a', segments: [segment] })
  await store.getState().loadVideo('video-b')
  for (let i = 0; i < 4; i++) await tick()
  assert.equal(store.getState().cloudSessionId, 'cloud-video-b')
  assert.ok(cloudCalls.some(call => call.id === 'cloud-video-b'))
  assert.ok(cloudCalls.filter(call => call.id === 'cloud-video-a').every(call => call.segments.length === 1))
})

test('restoring a cloud session never autosaves an empty hydration state', async () => {
  const { store, cloudCalls } = makeStore({ id: 'test-user' }, {
    getLastSession: async () => ({ sessionId: 'cloud-video-a', videoId: 'video-a' }),
    getSegments: async () => [segment],
  })
  await Promise.all([store.getState().initialize(), store.getState().initialize()])
  await tick()
  assert.equal(store.getState().segments.length, 1)
  assert.equal(cloudCalls.length, 0)
})

test('rapid navigation ignores an older video load that completes last', async () => {
  let releaseOlder
  let olderStarted
  const started = new Promise(resolve => { olderStarted = resolve })
  const user = { id: 'test-user' }
  const { store } = makeStore(user, {
    findSession: async id => {
      if (id === 'video-b') {
        olderStarted()
        await new Promise(resolve => { releaseOlder = resolve })
      }
      return `cloud-${id}`
    },
  })
  store.setState({ user, authInitialized: true, videoId: 'video-a', segments: [segment] })
  const older = store.getState().loadVideo('video-b')
  await started
  await store.getState().loadVideo('video-c')
  releaseOlder()
  await older
  assert.equal(store.getState().videoId, 'video-c')
  assert.equal(store.getState().cloudSessionId, 'cloud-video-c')
  assert.equal((await StorageService.getSession('video-a')).segments.length, 1)
})

test('library waits for authentication on direct navigation', async () => {
  const { store } = makeStore({ id: 'test-user' })
  const calls = []
  const effects = []
  const mocks = {
    react: { ...require('react'), useState: initial => [initial, () => {}], useEffect: fn => effects.push(fn), useCallback: fn => fn },
    'next/navigation': { useRouter: () => ({ push() {} }) },
    '@/lib/store': { useAppStore: () => store.getState() },
    '@/lib/library-storage': { getLibrary: async () => { calls.push('guest'); return { groups: [] } } },
    '@/lib/services/library-service': { LibraryService: { getLibrary: async () => { calls.push('cloud'); return { groups: [] } } } },
    '@/lib/everyday-english': { EVERYDAY_ENGLISH_CHAPTERS: [], EVERYDAY_ENGLISH_PHRASE_COUNT: 0 },
  }
  for (const name of ['button', 'card', 'input', 'dialog', 'dropdown-menu']) mocks[`@/components/ui/${name}`] = new Proxy({}, { get: (_, name) => String(name) })
  const { default: Library } = load('app/library/page.tsx', mocks)
  Library()
  effects.splice(0).forEach(effect => effect())
  await tick()
  assert.deepEqual(calls, [])
  await store.getState().checkAuth()
  Library()
  effects.splice(0).forEach(effect => effect())
  await tick()
  assert.deepEqual(calls, ['cloud'])
})
