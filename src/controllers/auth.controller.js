const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const { z } = require('zod')
const env = require('../config/env')
const prisma = new PrismaClient()




const schemaRegister = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  senha: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/\d/, 'Senha deve conter pelo menos um número')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um caractere especial')
})




// Gera um token de acesso — dura 30 minutos
function criarTokenAcesso(userId) {
  return jwt.sign(
    { sub: String(userId), type: 'access' },
    env.SECRET_KEY,
    { expiresIn: env.ACCESS_TOKEN_EXPIRE_MINUTES * 60 }
  )
}

// Gera um refresh token — dura 7 dias
function criarRefreshToken(userId) {
  return jwt.sign(
    { sub: String(userId), type: 'refresh' },
    env.SECRET_KEY,
    { expiresIn: env.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 }
  )
}


function verificarToken(token, tipoEsperado) {
  try {
    const payload = jwt.verify(token, env.SECRET_KEY)

    if (payload.type !== tipoEsperado) return null

    return parseInt(payload.sub)
  } catch {
    return null
  }
}


async function register(req, res) {

  const resultado = schemaRegister.safeParse(req.body)

  if (!resultado.success) {
    return res.status(400).json({
      message: 'Dados inválidos',
      errors: resultado.error.flatten().fieldErrors
    })
  }

  const { nome, email, senha } = resultado.data

  try {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    })

    if (usuarioExistente) {
      return res.status(400).json({ message: 'E-mail já cadastrado' })
    }

    const senhaHash = await bcrypt.hash(senha, 12)

    await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash
      }
    })

    return res.status(201).json({ message: 'Usuário criado com sucesso!' })

  } catch (erro) {
    console.error(erro)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
}

module.exports = { register }