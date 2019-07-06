'use strict';

require('dotenv').config();
const debug = require('debug')('api:test');

const { postToAPI, getFromAPI } = require('../lib/');

const { TEST_ID } = process.env;

let IS_EMULATOR = false;

const ID = 'partnership-base.jrhquri1-mexico.jalisco-jrhquri1';
const TEST_PROPERTY = 'description';
const LANG = 'pt';
const TEST_SUBMISSION_TEXT = `<p>I am ${LANG} text for "${TEST_PROPERTY}"</p>`;

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

describe('POST route for "text"', () => {
  let rec;
  let originalText = '';

  test('get partnership works', () => {
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

  test('record has expected properties', () => {
    expect(typeof rec).toBe('object');
    expect(Object.keys(rec)).toContain(TEST_PROPERTY);
    expect(Object.keys(rec[TEST_PROPERTY])).toContain('text');
    originalText = rec[TEST_PROPERTY].text;
    // debug(rec.timestamps);
    // debug(originalText);
  });

  test('update translation works', () => {
    expect(IS_EMULATOR).toBe(true);
    const params = {
      id: ID,
      testId: TEST_ID,
      lang: LANG,
    };
    const submission = {};
    submission[TEST_PROPERTY] = TEST_SUBMISSION_TEXT;
    return postToAPI('updateTranslation', params, submission)
      .then((resData) => {
        // debug(resData.timestamps);
        // debug(resData[TEST_PROPERTY].text);
        expect(resData[TEST_PROPERTY].text).toBe(TEST_SUBMISSION_TEXT);
      });
  });

  test('restore original translation works', () => {
    expect(IS_EMULATOR).toBe(true);
    const params = {
      id: ID,
      testId: TEST_ID,
      lang: LANG,
    };
    const submission = {};
    submission[TEST_PROPERTY] = originalText;
    return postToAPI('updateTranslation', params, submission)
      .then((resData) => {
        expect(resData[TEST_PROPERTY].text).toBe(originalText);
      });
  });
});
