'use strict';

const { TEST_ID } = process.env;

module.exports = (req, res, next) => {
  let user = req.session.user || '';
  let isAuthenticated = Boolean(user);
  if (!isAuthenticated && Boolean(TEST_ID)) {
    if (req.query.testId === TEST_ID) {
      user = 'test';
      isAuthenticated = true;
    }
  }
  if (!isAuthenticated) {
    res.status(401).json({});
    return;
  }
  res.locals.user = user;
  res.locals.isAuthenticated = isAuthenticated;
  next();
};
