'use strict';

module.exports = (srcObj1, srcObj2) => {
  const obj = {};
  const obj2Keys = (srcObj2 instanceof Object) ? Object.keys(srcObj2) : [];

  Object.entries(srcObj1).forEach(([key, value]) => {
    const obj2KeyIndex = obj2Keys.indexOf(key);
    let valueToUse;
    if (obj2KeyIndex === -1) {
      valueToUse = value;
    } else {
      valueToUse = srcObj2[key];
      obj2Keys.splice(obj2KeyIndex, 1);
    }
    if (Array.isArray(valueToUse)) {
      obj[key] = [];
      valueToUse.forEach((arrayValue) => {
        obj[key].push(arrayValue);
      });
      return;
    }
    obj[key] = valueToUse;
  });
  obj2Keys.forEach((key) => {
    const valueToUse = srcObj2[key];
    if (Array.isArray(valueToUse)) {
      obj[key] = [];
      valueToUse.forEach((arrayValue) => {
        obj[key].push(arrayValue);
      });
      return;
    }
    obj[key] = valueToUse;
  });
  return obj;
};
