'use strict';

const debug = require('debug')('api:lib:post-to-api');
const fetch = require('node-fetch');

const CLIENT_API_ENDPOINT = 'http://localhost:3001';

const FETCH_OPTIONS = {
  method: 'GET',
};

module.exports = (methodName, params) => {
  let query = '';
  if (params) {
    const querySlugs = [];
    Object.entries(params).forEach(([name, value]) => {
      if (!value) return;
      querySlugs.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
    });
    if (querySlugs.length) query = `?${querySlugs.join('&')}`;
  }
  const options = Object.assign({ headers: { 'Content-Type': 'application/json' } }, FETCH_OPTIONS);
  const uri = `${CLIENT_API_ENDPOINT}/${methodName}${query}`;
  return fetch(uri, options)
    .then((res) => {
      if (!res.ok) {
        return null; // TODO: PROCESS ERROR
      }
      return res.json();
    });
};
