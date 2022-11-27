import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

/* Import Routes */
import postRoutes from './routes/posts.js'
import userRoutes from './routes/users.js'

const app = express()

app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
app.use(cors())

/** Routes */
app.use('/posts', postRoutes)
app.use('/users', userRoutes)
app.get('/', (req, res) => {
  res.send('APP IS RUNNING')
})

const PORT = process.env.PORT || 5000
const CONNECTION_URL = process.env.CONNECTION_URL
mongoose
  .connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`)),
  )
  .catch((error) => console.log(error.message))
