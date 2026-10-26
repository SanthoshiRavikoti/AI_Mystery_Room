import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { createCase, getCase, discoverClue, requestHint, accuse, getResult } from '../controllers/caseController.js'

export const caseRoutes = Router()
const generationLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: { code: 'RATE_LIMITED', message: 'Too many case requests. Please try again later.' } } })
caseRoutes.post('/', generationLimit, createCase)
caseRoutes.get('/:id', getCase)
caseRoutes.post('/:id/clues/:clueId/discover', discoverClue)
caseRoutes.post('/:id/hints', requestHint)
caseRoutes.post('/:id/accuse', accuse)
caseRoutes.get('/:id/result', getResult)
