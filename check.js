'use strict';

require('dotenv').config();
const debug = require('debug')('api:check');

const models = require('./models');

(async (myVal) => {
  const entities = await models.value.dump();
  debug(entities);
})();
