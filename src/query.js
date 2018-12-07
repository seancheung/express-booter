function mongoose(req, func, context) {
  const opt = req.$options;
  const query = func.call(context, opt.where);
  if (opt.offset) {
    query.skip(opt.offset);
  }
  if (opt.limit) {
    query.limit(opt.limit);
  }
  if (opt.sort) {
    query.limit(opt.sort);
  }
  if (opt.select) {
    query.select(opt.select);
  }

  return query;
}

function sequelize(req, func, context) {
  const opt = req.$options;

  return func.call(context, {
    where: opt.where,
    attributes: opt.select,
    offset: opt.offset,
    limit: opt.limit,
    order: opt.order
  });
}

module.exports = {
  mongoose,
  sequelize
};
