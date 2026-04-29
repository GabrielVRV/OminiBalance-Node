require('dotenv').config()

module.exports = {
  SECRET_KEY: process.env.SECRET_KEY,
  ALGORITHM: process.env.ALGORITHM || 'HS256',
  ACCESS_TOKEN_EXPIRE_MINUTES: parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES) || 30,
  REFRESH_TOKEN_EXPIRE_DAYS: parseInt(process.env.REFRESH_TOKEN_EXPIRE_DAYS) || 7,
}