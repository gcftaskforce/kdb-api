'use strict';

module.exports = (allRegionDefs, regionId) => {
  if (!Array.isArray(allRegionDefs)) return undefined;
  if (!regionId) return undefined;
  const regionSegments = regionId.split('.');
  const nationDef = allRegionDefs.find(d => (d.id === regionSegments[0]));
  if (!nationDef) return undefined;
  if (regionSegments.length === 1) return nationDef;
  if (!Array.isArray(nationDef.jurisdictions)) return undefined;
  return nationDef.jurisdictions.find(d => (d.id === regionId));
};
