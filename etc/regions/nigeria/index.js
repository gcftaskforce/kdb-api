'use strict';

const { mergeJurisdictionalFields } = require('../../../lib');

const jurisdictions = require('./jurisdictions');
const jurisdictionalFields = require('./jurisdictional-fields');

mergeJurisdictionalFields(jurisdictions, jurisdictionalFields);

module.exports = {
  id: 'nigeria',
  name: 'Nigeria',
  geoId: 'NG',
  navColumn: 4,
  currency: 'NGN',
  lang: 'en',
  fields: [{
    name: 'national_social_groups_percent',
    rows: [
      ['a1', 'Hausa and Fulani'],
      ['a2', 'Yoruba'],
      ['a3', 'Igbo (Ibo)'],
      ['a4', 'Ijaw'],
      ['a5', 'Kanuri'],
      ['a6', 'Ibibio'],
      ['a7', 'Tiv'],
      ['a8', 'Other'],
    ],
    otherId: 'a8',
  }],
  jurisdictions,
};
