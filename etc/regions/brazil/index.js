'use strict';

const { mergeJurisdictionalFields } = require('../../../lib');

const jurisdictions = require('./jurisdictions');
const jurisdictionalFields = require('./jurisdictional-fields');

mergeJurisdictionalFields(jurisdictions, jurisdictionalFields);

module.exports = {
  id: 'brazil',
  name: 'Brazil',
  geoId: 'BR',
  navColumn: 0,
  currency: 'BRL',
  lang: 'pt',
  jurisdictions,
};
