'use strict';

require('dotenv').config();
const debug = require('debug')('api:test');

const fetch = require('node-fetch');

const BASE_URI = `http://localhost:${process.env.PORT}`;

const REGION_ID = 'brazil.acre';
const LANG = 'pt';

/**
 * Test public API routes, namely:
 *    summary data
 *    'data' collection
 *    'framework' collection
 *    'partnership' collection
 */

describe('json route for "region defs"', () => {
  const COLLECTION_NAME = 'summary-data';
  let collection;

  test('API returns JSON', () => {
    return fetch(`${BASE_URI}/json/${COLLECTION_NAME}.json`)
      .then(res => res.json())
      .then((jsonData) => { collection = jsonData; return jsonData; });
  });

  test('"summary-data" exists and is populated', () => {
    // debug(collection);
    expect(collection).toHaveProperty('recs');
    expect(Array.isArray(collection.recs)).toBe(true);
    expect(collection.recs.length).not.toBe(0);
  });
});

describe('json route for "sumary-data" collection', () => {
  const COLLECTION_NAME = 'summary-data';
  let collection;

  test('API returns JSON', () => {
    return fetch(`${BASE_URI}/json/${COLLECTION_NAME}.json`)
      .then(res => res.json())
      .then((jsonData) => { collection = jsonData; return jsonData; });
  });

  test('"summary-data" exists and is populated', () => {
    // debug(collection);
    expect(collection).toHaveProperty('recs');
    expect(Array.isArray(collection.recs)).toBe(true);
    expect(collection.recs.length).not.toBe(0);
  });
});

describe('json route for "sumary-data" collection including labels', () => {
  const COLLECTION_NAME = 'summary-data';
  let collection;

  test('API returns JSON', () => {
    return fetch(`${BASE_URI}/json/${COLLECTION_NAME}-${LANG}.json`)
      .then(res => res.json())
      .then((jsonData) => { collection = jsonData; return jsonData; });
  });

  test('"summary-data" exists and is populated', () => {
    // debug(collection.labels);
    expect(collection).toHaveProperty('recs');
    expect(Array.isArray(collection.recs)).toBe(true);
    expect(collection.recs.length).not.toBe(0);

    expect(collection).toHaveProperty('labels');
    expect(Array.isArray(collection.labels)).toBe(true);
    expect(collection.labels.length).not.toBe(0);
  });
});

describe('json route for "labels" collection', () => {
  const COLLECTION_NAME = 'labels';
  let collection;

  test('API returns JSON', () => {
    return fetch(`${BASE_URI}/json/${COLLECTION_NAME}-${LANG}.json`)
      .then(res => res.json())
      .then((jsonData) => { collection = jsonData; return jsonData; });
  });

  test('"summary-data" exists and is populated', () => {
    expect(collection).toHaveProperty(COLLECTION_NAME);
    expect(Array.isArray(collection[COLLECTION_NAME])).toBe(true);
    expect(collection[COLLECTION_NAME].length).not.toBe(0);
  });
});

describe('json route for "data" collection', () => {
  const COLLECTION_NAME = 'data';
  let collection;

  test('API returns JSON', () => {
    return fetch(`${BASE_URI}/json/${COLLECTION_NAME}-${REGION_ID}-${LANG}.json`)
      .then(res => res.json())
      .then((jsonData) => { collection = jsonData; return jsonData; });
  });

  test('"array" exists and is populated', () => {
    const kind = 'array';
    expect(collection).toHaveProperty(kind);
    expect(collection[kind].length).not.toBe(0);
  });

  test('"contact" exists and is populated', () => {
    const kind = 'contact';
    expect(collection).toHaveProperty(kind);
    expect(collection[kind]).not.toBe(0);
  });

  test('"text" exists and is populated', () => {
    const kind = 'text';
    expect(collection).toHaveProperty(kind);
    expect(collection[kind]).not.toBe(0);
  });

  test('"value" exists and is populated', () => {
    const kind = 'value';
    expect(collection).toHaveProperty(kind);
    expect(collection[kind]).not.toBe(0);
  });
});

describe('json route for "framework" collection', () => {
  const COLLECTION_NAME = 'framework';
  let collection;
  const kind = COLLECTION_NAME;

  test('API return JSON', () => {
    return fetch(`${BASE_URI}/json/${COLLECTION_NAME}-${REGION_ID}-${LANG}.json`)
      .then(res => res.json())
      .then((jsonData) => { collection = jsonData; });
  });

  test(`"${kind}" exists and is populated`, () => {
    expect(collection).toHaveProperty(kind);
    expect(collection[kind].length).not.toBe(0);
  });
});

describe('json route for "partnership" collection', () => {
  const COLLECTION_NAME = 'partnership';
  let collection;
  const kind = COLLECTION_NAME;

  test('API returns JSON', () => {
    return fetch(`${BASE_URI}/json/${COLLECTION_NAME}-${REGION_ID}-${LANG}.json`)
      .then(res => res.json())
      .then((jsonData) => { collection = jsonData; });
  });

  test(`"${kind}" exists and is populated`, () => {
    expect(collection).toHaveProperty(kind);
    expect(collection[kind].length).not.toBe(0);
  });
});
