'use strict';

require('dotenv').config();
const debug = require('debug')('api:test');

const { postToAPI, getFromAPI } = require('../lib/');

const { TEST_ID } = process.env;

let IS_EMULATOR = false;

const ID = 'value-land_area-mexico.oaxaca';
const LANG = 'pt';
const TEST_VALUE_AMOUNT = 9999;
const TEST_SUBMISSION_STRING = '9,999';

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

describe('POST route for "value"', () => {
  let rec;
  let oldAmount;
  let oldTimestamp;
  let newTimestamp;

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
    oldTimestamp = rec.timestamp;
    // newAmount = oldAmount + ADDEND;
  });

  test('update value works', () => {
    expect(IS_EMULATOR).toBe(true);
    const params = {
      id: ID,
      testId: TEST_ID,
      lang: LANG,
    };
    const submission = {
      string: TEST_SUBMISSION_STRING,
      year: '',
      currency: '',
    };
    return postToAPI('updateEntity', params, submission)
      .then((resData) => {
        newTimestamp = resData.timestamp;
        expect(resData.amount).toBe(TEST_VALUE_AMOUNT);
        // debug(oldTimestamp, newTimestamp);
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
