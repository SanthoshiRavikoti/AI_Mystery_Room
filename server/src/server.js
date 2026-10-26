import 'dotenv/config'
import mongoose from 'mongoose'
import app from './app.js'

const port = Number(process.env.PORT) || 5000

try {
  await mongoose.connect(process.env.MONGODB_URI)
  app.listen(port, () => console.info(`Mystery Room API listening on port ${port}`))
} catch (error) {
  console.error('Unable to connect to MongoDB. Check MONGODB_URI and database access.')
  if (process.env.NODE_ENV !== 'production') console.error(error.message)
  process.exit(1)
}
