import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import { authenticateMerchant } from './middleware/auth'

const app = express()

app.use(morgan('dev'))
app.use(cors())
app.use('/webhooks', authenticateMerchant )
export default app