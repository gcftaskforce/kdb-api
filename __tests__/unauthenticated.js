'use strict';

require('dotenv').config();
const debug = require('debug')('api:test');

const { postToAPI } = require('../lib/');

const INVALID_TEST_ID = '7cef1b27-fc6c-4506-92cf-171ab695d395';

const ID = 'value-land_area-mexico.oaxaca';
const LANG = 'pt';

describe('POST route for "value" (invalid authentication)', () => {
  let apiResponse;

  test('API call works', () => {
    const params = {
      id: ID,
      lang: LANG,
      testId: INVALID_TEST_ID,
    };
    return postToAPI('get', params)
      .then((resData) => {
        apiResponse = resData;
      });
  });

  test('unauthenticated POST returns 401', () => {
    expect(apiResponse).toBe(null);
  });
});
