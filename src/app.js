const express = require('express')

const app = express()

app.use(express.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

const authRoutes = require('./routes/auth.routes')
app.use('/auth', authRoutes)

app.get('/', (req, res) => {
  res.json({ status: 'OmniBalance Online' })
})

module.exports = app