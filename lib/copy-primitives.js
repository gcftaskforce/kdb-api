'use strict';

module.exports = ((srcArray, nameOfChildArray) => {
  const array = [];
  if (!Array.isArray(srcArray)) return array;
  srcArray.forEach((nation) => {
    const nObj = {};
    if (nameOfChildArray) nObj[nameOfChildArray] = [];
    Object.entries(nation).forEach(([nKey, nVal]) => {
      if (typeof nVal !== 'object') nObj[nKey] = nVal;
    });
    array.push(nObj);
    if (!nameOfChildArray) return;
    if (!Array.isArray(nation[nameOfChildArray])) return;
    (nation[nameOfChildArray]).forEach((jurisdiction) => {
      const jObj = {};
      Object.entries(jurisdiction || []).forEach(([jKey, jVal]) => {
        if (typeof jVal !== 'object') jObj[jKey] = jVal;
      });
      nObj.jurisdictions.push(jObj);
    });
  });
  return array;
});
