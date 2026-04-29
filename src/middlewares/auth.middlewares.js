const jwt = require('jsonwebtoken')
const env = require('../config/env')

function autenticar(req, res, next) {

  const authHeader = req.headers['authorization']

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' })
  }

  const partes = authHeader.split(' ')

  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Formato de token inválido' })
  }

  const token = partes[1]

  try {
    const payload = jwt.verify(token, env.SECRET_KEY)

    if (payload.type !== 'access') {
      return res.status(401).json({ message: 'Tipo de token inválido' })
    }

    req.usuarioId = parseInt(payload.sub)

    next()

  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' })
  }
}

module.exports = { autenticar }