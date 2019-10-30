const { forwardTo } = require('prisma-binding')
const loginUtils = require('../utils/login')
const { errorIfFalse } = require('../utils/error')

const Query = {
  items: forwardTo('db'),

  item: forwardTo('db'),

  itemsConnection: forwardTo('db'),

  me(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      return null
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId },
      },
      info,
    )
  },

  async users(parent, args, ctx, info) {
    errorIfFalse(!ctx.request.userId, 'You must be logged in to do that')
    loginUtils.hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE'])
    return ctx.db.query.users({}, info)
  },

  async order(parent, args, ctx, info) {
    errorIfFalse(!ctx.request.userId, 'You must be logged in to do that')
    const order = await ctx.db.query.order(
      {
        where: { id: args.id },
      },
      info,
    )
    const ownsOrder = order.user.id === ctx.request.userId
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes(
      'ADMIN',
    )
    errorIfFalse(
      !ownsOrder || !hasPermissionToSeeOrder,
      "You can't see this pal!",
    )
    return order
  },

  async orders(parent, args, ctx, info) {
    const { userId } = ctx.request
    errorIfFalse(!userId, 'You must be logged in to do that')
    return await ctx.db.query.orders(
      {
        where: {
          user: {
            id: userId,
          },
        },
      },
      info,
    )
  },
}

module.exports = Query
