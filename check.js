'use strict';

require('dotenv').config();
const debug = require('debug')('api:check');

const { Datastore } = require('@google-cloud/datastore');

const ds = new Datastore();

// const models = require('./models');

(async () => {
  // const entities = await models.value.dump();
  // debug(entities);
  const dsQuery = ds.createQuery('Value');
  let entities = [];
  try {
    const results = await ds.runQuery(dsQuery);
    if (results[0].length) {
      [entities] = results;
    }
  } catch (err) {
    throw err;
  }
  debug(entities);
  return entities;
})();
