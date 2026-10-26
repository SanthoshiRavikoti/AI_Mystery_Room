import { ZodError } from 'zod'

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message || 'Check the submitted information.' } })
  if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'The request body must be valid JSON.' } })
  if (error.status) return res.status(error.status).json({ error: { code: error.code || 'REQUEST_ERROR', message: error.message } })
  if (error.message === 'Origin not allowed by CORS') return res.status(403).json({ error: { code: 'ORIGIN_NOT_ALLOWED', message: 'This origin is not allowed.' } })
  console.error('Unhandled API error:', error.message)
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' } })
}
