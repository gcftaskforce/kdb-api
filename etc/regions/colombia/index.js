'use strict';

const { mergeJurisdictionalFields } = require('../../../lib');

const jurisdictions = require('./jurisdictions');
const jurisdictionalFields = require('./jurisdictional-fields');

mergeJurisdictionalFields(jurisdictions, jurisdictionalFields);

module.exports = {
  id: 'colombia',
  name: 'Colombia',
  geoId: 'CO',
  navColumn: 4,
  currency: 'COP',
  lang: 'es',
  jurisdictions,
};
