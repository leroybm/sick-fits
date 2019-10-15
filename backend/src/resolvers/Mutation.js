const { errorIfFalse } = require('../utils/error')
const loginUtils = require('../utils/login')
const { HOUR } = loginUtils

const Mutation = {
  /**
   * Creates item in store
   * @param {*} parent
   * @param {*} args
   * @param {*} ctx
   * @param {*} info
   */
  async createItem(parent, args, ctx, info) {
    // TODO: Check if they are logged in

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args,
        },
      },
      info,
    )

    return item
  },

  /**
   * Updates store item
   * @param {*} parent
   * @param {*} args
   * @param {*} ctx
   * @param {*} info
   */
  updateItem(parent, args, ctx, info) {
    const updates = { ...args }
    delete updates.id
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info,
    )
  },

  /**
   * Deletes item from store
   * @param {*} parent
   * @param {*} args
   * @param {*} ctx
   * @param {*} info
   */
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id }
    const item = await ctx.db.query.item({ where }, `{ id title }`)
    // TODO check if we own it
    return ctx.db.mutation.deleteItem({ where }, info)
  },

  /**
   * Creates user account
   * @param {*} parent
   * @param {*} args
   * @param {*} ctx
   * @param {*} info
   */
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase()
    const password = await loginUtils.hashPassword(args.password)
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] },
        },
      },
      info,
    )
    loginUtils.setLoginCookie(user.id, ctx)
    return user
  },

  /**
   * Signs user in
   * @param {*} parent
   * @param {*} args
   * @param {*} ctx
   * @param {*} info
   */
  async signin(parent, args, ctx, info) {
    const { email, password } = args
    const user = await ctx.db.query.user({ where: { email } })
    errorIfFalse(!user, `No such user found for email ${email}`)
    const valid = await loginUtils.comparePasswords(password, user.password)
    errorIfFalse(!valid, 'Invalid password!')
    loginUtils.setLoginCookie(user.id, ctx)
    return user
  },

  /**
   * Signs user out
   * @param {*} parent
   * @param {*} args
   * @param {*} ctx
   * @param {*} info
   */
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token')
    return { message: 'Success!' }
  },

  /**
   * Request reset token
   * @param {*} parent
   * @param {*} args
   * @param {*} ctx
   * @param {*} info
   */
  async requestReset(parent, args, ctx, info) {
    const { email } = args
    const user = await ctx.db.query.user({ where: { email } })
    errorIfFalse(!user, `No such user found for email ${email}`)
    const resetToken = await loginUtils.generateResetToken()
    const resetTokenExpiry = Date.now() + HOUR
    const res = await ctx.db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    })
    return { message: 'Success' }
  },

  /**
   * Verifies password and resetToken, then resets user password
   * @param {*} parent
   * @param {*} args
   * @param {*} ctx
   * @param {*} info
   */
  async resetPassword(parent, args, ctx, info) {
    const { password, confirmPassword, resetToken } = args
    errorIfFalse(password !== confirmPassword, `Passwords don't match`)
    const [user] = await ctx.db.query.users({
      where: { resetToken, resetTokenExpiry_gte: Date.now() - HOUR },
    })
    errorIfFalse(!user, 'Invalid reset request, please try again.')
    const newPassword = await loginUtils.hashPassword(password)
    const updatedUser = await ctx.db.mutation.updateUser(
      {
        data: {
          password: newPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
        where: {
          id: user.id,
        },
      },
      info,
    )
    loginUtils.setLoginToken(updatedUser.id, ctx)
    return updatedUser
  },
}

module.exports = Mutation
