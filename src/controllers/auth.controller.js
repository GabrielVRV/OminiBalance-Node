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


// Função chamada quando alguém faz POST em /auth/login
async function login(req, res) {

  // Valida os dados que chegaram — só precisa de email e senha
  const schemaLogin = z.object({
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(1, 'Senha é obrigatória')
  })

  const resultado = schemaLogin.safeParse(req.body)

  if (!resultado.success) {
    return res.status(400).json({
      message: 'Dados inválidos',
      errors: resultado.error.flatten().fieldErrors
    })
  }

  const { email, senha } = resultado.data

  try {
    // Busca o usuário pelo email no banco
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos' })
    }

    if (!usuario.ativo) {
      return res.status(401).json({ message: 'Usuário inativo' })
    }

    const accessToken = criarTokenAcesso(usuario.id)
    const refreshToken = criarRefreshToken(usuario.id)

    return res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
      expires_in: env.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        ativo: usuario.ativo,
        admin: usuario.admin
      }
    })

  } catch (erro) {
    console.error(erro)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
}



// Retorna os dados do usuário logado
async function me(req, res) {
  try {
    // req.usuarioId foi colocado lá pelo middleware
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      // Seleciona só os campos necessários — nunca retorna a senha
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
        admin: true
      }
    })

    return res.json(usuario)

  } catch (erro) {
    console.error(erro)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
}

// Gera um novo access token usando o refresh token
async function refresh(req, res) {

  const schema = z.object({
    refresh_token: z.string().min(1, 'Refresh token é obrigatório')
  })

  const resultado = schema.safeParse(req.body)

  if (!resultado.success) {
    return res.status(400).json({ message: 'Refresh token é obrigatório' })
  }

  const { refresh_token } = resultado.data

  const userId = verificarToken(refresh_token, 'refresh')

  if (!userId) {
    return res.status(401).json({ message: 'Refresh token inválido ou expirado' })
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId }
    })

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ message: 'Usuário não encontrado ou inativo' })
    }

    const novoAccessToken = criarTokenAcesso(usuario.id)

    return res.json({
      access_token: novoAccessToken,
      token_type: 'bearer',
      expires_in: env.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    })

  } catch (erro) {
    console.error(erro)
    return res.status(500).json({ message: 'Erro interno do servidor' })
  }
}

module.exports = { register, login, me, refresh }