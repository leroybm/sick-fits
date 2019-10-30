const { errorIfFalse } = require('../utils/error')
const loginUtils = require('../utils/login')
const { HOUR } = loginUtils
const { transport, makeANiceEmail } = require('../mail')
const stripe = require('../stripe')

const Mutation = {
  /**
   * Creates item in store
   * @param {*} parent
   * @param {*} args
   * @param {*} ctx
   * @param {*} info
   */
  async createItem(parent, args, ctx, info) {
    errorIfFalse(!ctx.request.userId, 'You must be logged in to do that')
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          user: {
            connect: {
              id: ctx.request.userId,
            },
          },
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
    errorIfFalse(!ctx.request.userId, 'You must be logged in!')
    const where = { id: args.id }
    const item = await ctx.db.query.item({ where }, `{ id title user { id }}`)
    const onwsItem = item.user.id === ctx.request.userId
    const hasPermission = ctx.request.user.permissions.some(permission =>
      ['ADMIN', 'ITEMDELETE'].includes(permission),
    )
    errorIfFalse(
      !(onwsItem || !hasPermission),
      "You don't have permission to do that!",
    )
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
    loginUtils.setLoginToken(user.id, ctx)
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
    loginUtils.setLoginToken(user.id, ctx)
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
    const mailResponse = await transport.sendMail({
      from: 'leroy@leroy.com',
      to: user.email,
      subject: 'Your password reset token',
      html: makeANiceEmail(`Your password reset token is here
      \n\n <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click here to reset</a>`),
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

  async updatePermissions(parent, args, ctx, info) {
    errorIfFalse(!ctx.request.userId, 'You must be logged in!')
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId,
        },
      },
      info,
    )
    loginUtils.hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE'])
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions,
          },
        },
        where: {
          id: args.userId,
        },
      },
      info,
    )
  },

  async addToCart(parent, args, ctx, info) {
    const { userId } = ctx.request
    errorIfFalse(!userId, 'You must be logged in!')
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      },
    })
    if (existingCartItem) {
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 },
        },
        info,
      )
    }
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          item: {
            connect: {
              id: args.id,
            },
          },
        },
      },
      info,
    )
  },

  async removeFromCart(parent, args, ctx, info) {
    const { userId } = ctx.request
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id,
        },
      },
      `{ id, user { id }}`,
    )
    errorIfFalse(!cartItem, 'No CartItem Found!')
    errorIfFalse(cartItem.user.id !== userId, "This item isn't in your cart")
    return await ctx.db.mutation.deleteCartItem(
      {
        where: {
          id: args.id,
        },
      },
      info,
    )
  },

  async createOrder(parent, args, ctx, info) {
    const { userId } = ctx.request
    errorIfFalse(!userId, 'You must be logged in to complete this order.')
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
        id
        name
        email
        cart {
          id
          quantity
          item {
            title
            price
            id
            description
            image
            largeImage
          }
        }
      }`,
    )
    const amount = user.cart.reduce(
      (tally, cartItem) => tally + cartItem.item.price * cartItem.quantity,
      0,
    )
    const charge = await stripe.charges.create({
      amount,
      currency: 'BRL',
      source: args.token,
    })
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: {
          connect: {
            id: userId,
          },
        },
      }
      delete orderItem.id
      return orderItem
    })
    const order = await ctx.db.mutation.createOrder(
      {
        data: {
          total: charge.amount,
          charge: charge.id,
          items: {
            create: orderItems,
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      },
      info,
    )
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: user.cart.map(cartItem => cartItem.id),
      },
    })
    return order
  },
}

module.exports = Mutation
