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
}

module.exports = Query
