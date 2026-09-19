const { test } = require('node:test')
const assert = require('node:assert/strict')
const load = require('./load-module.cjs')

function makeService(failUpsert = false) {
  const calls = []
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: 'test-user' } } }) },
    from(table) {
      return {
        select() { return { eq: async () => ({ data: [{ id: 'removed-clip' }], error: null }) } },
        async upsert(rows) {
          calls.push({ action: 'upsert', rows })
          return { error: failUpsert ? new Error('Simulated database failure') : null }
        },
        delete() {
          return { eq: (_, sessionId) => ({ in: async (_, ids) => {
            calls.push({ action: 'delete', sessionId, ids }); return { error: null }
          } }) }
        },
        update() { return { eq: async () => { calls.push({ action: 'update', table }); return { error: null } } } },
      }
    },
  }
  const { SessionService } = load('lib/services/session-service.ts', {
    '@/utils/supabase/client': { createClient: () => client },
  }, { console: { ...console, error() {} } })
  return { service: SessionService, calls }
}

const segment = { id: 'curated-clip-1', start: 1, end: 5, label: 'Practice', lines: [], createdAt: 1 }

test('failed cloud upsert preserves existing segments', async () => {
  const { service, calls } = makeService(true)
  assert.equal(await service.syncSession('session-a', [segment]), false)
  assert.deepEqual(calls.map(call => call.action), ['upsert'])
})

test('cloud sync uses stable, session-scoped curated IDs and only deletes after saving', async () => {
  const { service, calls } = makeService()
  assert.equal(await service.syncSession('session-a', [segment]), true)
  const firstId = calls[0].rows[0].id
  assert.match(firstId, /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  assert.deepEqual(calls.map(call => call.action), ['upsert', 'delete', 'update'])
  assert.deepEqual(calls[1].ids, ['removed-clip'])
  await service.syncSession('session-a', [segment])
  assert.equal(calls[3].rows[0].id, firstId)
  await service.syncSession('session-b', [segment])
  assert.notEqual(calls[6].rows[0].id, firstId)
})

test('cloud sync retains UUIDs restored from the database', async () => {
  const { service, calls } = makeService()
  const id = '330fc446-de74-49f0-bd33-a03f8e73d68c'
  await service.syncSession('session-a', [{ ...segment, id }])
  assert.equal(calls[0].rows[0].id, id)
})
