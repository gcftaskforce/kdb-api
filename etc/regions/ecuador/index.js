'use strict';

const { mergeJurisdictionalFields } = require('../../../lib');

const jurisdictions = require('./jurisdictions');
const jurisdictionalFields = require('./jurisdictional-fields');

mergeJurisdictionalFields(jurisdictions, jurisdictionalFields);

module.exports = {
  id: 'ecuador',
  name: 'Ecuador',
  geoId: 'EC',
  navColumn: 4,
  currency: 'USD',
  lang: 'es',
  jurisdictions,
};
