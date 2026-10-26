import mongoose from 'mongoose'

const suspectSchema = new mongoose.Schema({
  id: { type: String, required: true }, name: { type: String, required: true },
  profile: { type: String, required: true }, motive: { type: String, required: true },
  opportunity: { type: String, default: '' }, alibi: { type: String, required: true },
}, { _id: false })

const clueSchema = new mongoose.Schema({
  id: { type: String, required: true }, title: { type: String, required: true },
  description: { type: String, required: true }, content: { type: String, required: true },
  relatedSuspectIds: { type: [String], default: [] },
}, { _id: false })

const caseSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 140 },
  premise: { type: String, required: true, maxlength: 800 },
  story: { type: String, required: true, maxlength: 12000 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  suspects: { type: [suspectSchema], required: true }, clues: { type: [clueSchema], required: true },
  hints: { type: [String], required: true },
  timeline: { type: [String], default: [] },
  solution: { culpritId: { type: String, required: true }, explanation: { type: String, required: true }, clueRationale: { type: [String], required: true } },
  discoveredClueIds: { type: [String], default: [] }, usedHintCount: { type: Number, default: 0, min: 0 },
  accusation: { suspectId: String, submittedAt: Date }, score: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
}, { timestamps: true, minimize: false })

export const Case = mongoose.model('Case', caseSchema)
