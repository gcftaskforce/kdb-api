'use strict';

module.exports = (req, res, next) => {
  const user = req.session.user || '';
  const isAuthenticated = Boolean(user);
  if (!isAuthenticated) {
    res.status(401).json({});
    return;
  }
  res.locals.user = user;
  res.locals.isAuthenticated = isAuthenticated;
  next();
};
