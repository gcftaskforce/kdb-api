'use strict';

const brazil = require('./brazil');
const colombia = require('./colombia');
const ecuador = require('./ecuador');
const indonesia = require('./indonesia');
const ivoryCoast = require('./ivory_coast');
const mexico = require('./mexico');
const nigeria = require('./nigeria');
const peru = require('./peru');

const nations = [
  brazil,
  colombia,
  ecuador,
  indonesia,
  ivoryCoast,
  mexico,
  nigeria,
  peru,
];
/**
 * as a convenience:
 *  1) copy the nation properties: (nation) "name"; "currency"; and "lang" into each memeber jurisdiction
 *  2) include array of all member jurisdictions (name and id) within each nation and jurisdiction
 */
nations.forEach((nation) => {
  const memberJurisdictions = [];
  (nation.jurisdictions || []).forEach((jurisdiction) => {
    jurisdiction.nationName = nation.name || '';
    jurisdiction.currency = nation.currency || '';
    jurisdiction.lang = nation.lang || '';
    memberJurisdictions.push({
      id: jurisdiction.id,
      slug: jurisdiction.id.split('.')[1] || jurisdiction.id,
      name: jurisdiction.name,
      shortName: jurisdiction.shortName || '',
    });
    jurisdiction.memberJurisdictions = memberJurisdictions;
  });
  nation.memberJurisdictions = memberJurisdictions;
});

module.exports = nations;
