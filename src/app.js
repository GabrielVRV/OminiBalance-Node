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
app.use('/accounts',      require('./routes/accounts.routes'))
app.use('/cards',         require('./routes/cards.routes'))
app.use('/third-parties', require('./routes/third-parties.routes'))
app.use('/categories',    require('./routes/categories.routes'))
app.use('/transactions',  require('./routes/transactions.routes'))
app.use('/assets',        require('./routes/assets.routes'))
app.use('/reports',       require('./routes/reports.routes'))

app.get('/', (req, res) => {
  res.json({ status: 'OmniBalance Online' })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Erro interno do servidor' })
})

module.exports = app