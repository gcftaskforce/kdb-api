'use strict';

require('dotenv').config();
const debug = require('debug')('api:test');

const { postToAPI, getFromAPI } = require('../lib/');

const { TEST_ID } = process.env;

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

describe('POST route for "value"', () => {
  let rec;
  let oldCitation;
  const newCitation = '<p>citation</p>';

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

  test('record has "citation" of type string and non-zero length ', () => {
    expect(typeof rec).toBe('object');
    expect(Object.keys(rec)).toContain('citation');
    expect(typeof rec.citation).toBe('string');
    expect(rec.citation.length).not.toBe(0);
    oldCitation = rec.citation;
  });

  test('update citation works', () => {
    expect(IS_EMULATOR).toBe(true);
    const params = {
      id: ID,
      testId: TEST_ID,
      lang: LANG,
    };
    const submission = {
      citation: newCitation,
    };
    return postToAPI('updateCitation', params, submission)
      .then((resData) => {
        expect(resData.citation).toBe(newCitation);
      });
  });

  test('restore original citation works', () => {
    expect(IS_EMULATOR).toBe(true);
    const params = {
      id: ID,
      testId: TEST_ID,
      lang: LANG,
    };
    const submission = {
      citation: oldCitation,
    };
    return postToAPI('updateCitation', params, submission)
      .then((resData) => {
        expect(resData.citation).toBe(oldCitation);
      });
  });
});
