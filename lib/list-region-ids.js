'use strict';

module.exports = (allRegionDefs) => {
  const list = [];
  if (!Array.isArray(allRegionDefs)) return list;
  allRegionDefs.forEach((n) => {
    list.push(n.id);
    (n.jurisdictions || []).forEach(j => list.push(j.id));
  });
  return list;
};
