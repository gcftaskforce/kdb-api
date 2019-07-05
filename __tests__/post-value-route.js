'use strict';

require('dotenv').config();
const debug = require('debug')('api:test');

// const fetch = require('node-fetch');

const { postToAPI, getFromAPI } = require('../lib/');

const { TEST_ID } = process.env;
const INVALID_TEST_ID = '7cef1b27-fc6c-4506-92cf-171ab695d395';

let IS_EMULATOR = false;

const ID = 'value-land_area-mexico.oaxaca';
const LANG = 'pt';

describe('json route for "region-defs"', () => {
  let data;
  test('API returns JSON', () => {
    return getFromAPI('json/region-defs.json')
      .then((resData) => {
        data = resData;
        IS_EMULATOR = Boolean(data || data.isEmulator);
      });
  });

  test('responds with object', () => {
    expect(typeof data).toBe('object');
  });
});

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

describe('POST route for "value"', () => {
  const ADDEND = 10;
  let rec;
  let oldAmount;
  let newAmount;

  test('get value works', () => {
    const params = {
      id: ID,
      lang: LANG,
      testId: TEST_ID,
    };
    return postToAPI('get', params)
      .then((resData) => {
        rec = resData;
      });
  });

  test('record has amount', () => {
    expect(typeof rec).toBe('object');
    expect(Object.keys(rec)).toContain('amount');
    oldAmount = rec.amount || 0;
    newAmount = oldAmount + ADDEND;
  });

  test('update value works', () => {
    expect(IS_EMULATOR).toBe(true);
    const params = {
      id: ID,
      testId: TEST_ID,
      lang: LANG,
    };
    const submission = {
      string: String(newAmount),
      year: '',
      currency: '',
    };
    return postToAPI('updateEntity', params, submission)
      .then((resData) => {
        expect(resData.amount).toBe(newAmount);
      });
  });

  test('restore original value works', () => {
    expect(IS_EMULATOR).toBe(true);
    const params = {
      id: ID,
      testId: TEST_ID,
      lang: LANG,
    };
    const submission = {
      string: String(oldAmount),
      year: '',
      currency: '',
    };
    return postToAPI('updateEntity', params, submission)
      .then((resData) => {
        expect(resData.amount).toBe(oldAmount);
      });
  });
});
