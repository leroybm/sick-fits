const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { randomBytes } = require('crypto')
const { promisify } = require('util')

const HOUR = 1000 * 60 * 60
const YEAR = HOUR * 24 * 365

/**
 * Sets user login cookie with jwt
 * @param {String} userId
 * @param {*} ctx
 */
function setLoginToken(userId, ctx) {
  const token = jwt.sign({ userId }, process.env.APP_SECRET)
  ctx.response.cookie('token', token, {
    httpOnly: true,
    maxAge: YEAR,
  })
}

/**
 * Hashes a password
 * @async
 * @param {String} password
 * @returns {String}
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}

/**
 * Compare two passwords
 * @async
 * @param {String} a
 * @param {String} b
 * @returns {Boolean}
 */
async function comparePasswords(a, b) {
  return await bcrypt.compare(a, b)
}

/**
 * Generates a reset token
 * @async
 * @returns {String}
 */
async function generateResetToken() {
  const randomBytesPromisified = promisify(randomBytes)
  return (await randomBytesPromisified(20)).toString('hex')
}

/**
 * Check if user has the permissions needed
 * @param {Object} user
 * @param {String[]} permissionsNeeded
 */
function hasPermission(user, permissionsNeeded) {
  const matchedPermissions = user.permissions.filter(permissionTheyHave =>
    permissionsNeeded.includes(permissionTheyHave),
  )
  if (!matchedPermissions.length) {
    throw new Error(`You do not have sufficient permissions

      : ${permissionsNeeded}

      You Have:

      ${user.permissions}
      `)
  }
}

module.exports = {
  setLoginToken,
  hashPassword,
  comparePasswords,
  generateResetToken,
  hasPermission,
  HOUR,
  YEAR,
}
