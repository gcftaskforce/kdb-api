'use strict';

/** accepts a region ID string (e.g. "global", "brazil" or "mexico.campeche") and returns a string
 * "global", "national" or "jurisdictional"
*/
module.exports = (regionId) => {
  if (['global', 'national', 'jurisdictional'].includes(regionId)) return regionId;
  return regionId.includes('.') ? 'jurisdictional' : 'national';
};
