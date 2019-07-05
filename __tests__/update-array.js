'use strict';

require('dotenv').config();
const debug = require('debug')('api:test');

const { postToAPI, getFromAPI } = require('../lib/');

const { TEST_ID } = process.env;

let IS_EMULATOR = false;

const ID = 'array-forest_management-mexico.chiapas';
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

describe('POST route for "array"', () => {
  let rec;

  test('get array works', () => {
    const params = {
      id: ID,
      lang: LANG,
      testId: TEST_ID,
    };
    return postToAPI('get', params)
      .then((resData) => {
        rec = resData;
        debug(rec);
      });
  });

  test('record has expected properties', () => {
    expect(typeof rec).toBe('object');
    expect(Object.keys(rec)).toContain('rows');
    // debug(rec);
  });

  // test('update value works', () => {
  //   expect(IS_EMULATOR).toBe(true);
  //   const params = {
  //     id: ID,
  //     testId: TEST_ID,
  //     lang: LANG,
  //   };
  //   const submission = {
  //     string: String(newAmount),
  //     year: '',
  //     currency: '',
  //   };
  //   return postToAPI('updateEntity', params, submission)
  //     .then((resData) => {
  //       expect(resData.amount).toBe(newAmount);
  //     });
  // });

  // test('restore original value works', () => {
  //   expect(IS_EMULATOR).toBe(true);
  //   const params = {
  //     id: ID,
  //     testId: TEST_ID,
  //     lang: LANG,
  //   };
  //   const submission = {
  //     string: String(oldAmount),
  //     year: '',
  //     currency: '',
  //   };
  //   return postToAPI('updateEntity', params, submission)
  //     .then((resData) => {
  //       expect(resData.amount).toBe(oldAmount);
  //     });
  // });
});
