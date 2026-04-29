const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const { autenticar } = require('../middlewares/auth.middlewares')

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/me', autenticar, authController.me)
router.post('/refresh', authController.refresh)

module.exports = router