import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import app from '../src/app.js'

let server
let origin

before(async () => {
  server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  origin = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

test('health endpoint reports the API is available', async () => {
  const response = await fetch(`${origin}/api/health`)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { status: 'ok' })
})

test('invalid create-case input returns a safe validation error', async () => {
  const response = await fetch(`${origin}/api/cases`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ premise: '', difficulty: 'impossible' }) })
  assert.equal(response.status, 400)
  const payload = await response.json()
  assert.equal(payload.error.code, 'VALIDATION_ERROR')
  assert.equal(typeof payload.error.message, 'string')
  assert.equal(JSON.stringify(payload).includes('stack'), false)
})

test('malformed JSON returns a client error and an invalid case ID returns not found', async () => {
  const malformed = await fetch(`${origin}/api/cases`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })
  assert.equal(malformed.status, 400)
  assert.equal((await malformed.json()).error.code, 'INVALID_JSON')
  const missing = await fetch(`${origin}/api/cases/not-an-object-id`)
  assert.equal(missing.status, 404)
  assert.equal((await missing.json()).error.code, 'NOT_FOUND')
})
