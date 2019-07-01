'use strict';

const { mergeJurisdictionalFields } = require('../../../lib');

const jurisdictions = require('./jurisdictions');
const jurisdictionalFields = require('./jurisdictional-fields');

mergeJurisdictionalFields(jurisdictions, jurisdictionalFields);

module.exports = {
  id: 'peru',
  name: 'Peru',
  geoId: 'PE',
  navColumn: 3,
  currency: 'PEN',
  lang: 'es',
  fields: [{
    name: 'national_social_groups_percent',
    rows: [
      ['a1', 'Ashaninka'],
      ['a2', 'Aguaruna'],
      ['a3', 'Shipibo-Conibo'],
      ['a4', 'Chayahuitas'],
      ['a5', 'Quichuas'],
      ['a6', 'Other'],
    ],
    otherId: 'a6',
  }],
  jurisdictions,
};
