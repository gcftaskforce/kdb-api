'use strict';

require('dotenv').config();
const debug = require('debug')('api:test');

const { postToAPI, getFromAPI } = require('../lib/');

const { TEST_ID } = process.env;

let IS_EMULATOR = false;

const ID = 'text.html-overviewForestMonitoringAndMeasurementSystems-brazil.acre';
const LANG = 'pt';
const TEST_SUBMISSION_TEXT = `<p>I am ${LANG} text</p>`;

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

  test('get contact works', () => {
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
    expect(Object.keys(rec)).toContain('text');
    originalText = rec.text;
    debug(rec.timestamps);
    // debug(rec.text);
  });

  test('update translation works', () => {
    expect(IS_EMULATOR).toBe(true);
    const params = {
      id: ID,
      testId: TEST_ID,
      lang: LANG,
    };
    const submission = {
      text: TEST_SUBMISSION_TEXT,
    };
    return postToAPI('updateTranslation', params, submission)
      .then((resData) => {
        expect(resData.text).toBe(TEST_SUBMISSION_TEXT);
        // debug(resData.timestamps);
      });
  });

  test('restore original translation works', () => {
    expect(IS_EMULATOR).toBe(true);
    const params = {
      id: ID,
      testId: TEST_ID,
      lang: LANG,
    };
    const submission = {
      text: originalText,
    };
    return postToAPI('updateTranslation', params, submission)
      .then((resData) => {
        expect(resData.text).toBe(originalText);
      });
  });
});
