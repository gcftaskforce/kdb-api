'use strict';

const { mergeJurisdictionalFields } = require('../../../lib');

const jurisdictions = require('./jurisdictions');
const jurisdictionalFields = require('./jurisdictional-fields');

mergeJurisdictionalFields(jurisdictions, jurisdictionalFields);

module.exports = {
  id: 'ivory_coast',
  name: 'Ivory Coast',
  geoId: 'CI',
  gisName: 'Côte d\'Ivoire',
  navColumn: 4,
  currency: 'CFA Fran',
  lang: 'fr',
  jurisdictions,
};
