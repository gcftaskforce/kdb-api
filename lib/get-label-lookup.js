'use strict';

const findLabelTranslation = require('./find-label-translation');

module.exports = (labelDefs, lang, fallbackLang) => {
  const lookup = {};
  if (!Array.isArray(labelDefs)) return lookup;
  labelDefs.forEach((labelDef) => {
    if (!labelDef.name) return;
    if (!labelDef.labels) return;
    lookup[labelDef.name] = findLabelTranslation(labelDef.labels, lang, fallbackLang);
  });
  return lookup;
};
