'use strict';

const FALLBACK_TEXT = '';

module.exports = (submission, fieldName, lang = 'en', fallbackLang) => {
  if (!submission) return FALLBACK_TEXT;
  let compositeFieldName = `${fieldName}-${lang}`;
  if ((typeof submission[compositeFieldName] === 'string') && submission[compositeFieldName].length) return submission[compositeFieldName];
  if (!fallbackLang) return FALLBACK_TEXT;
  compositeFieldName = `${fieldName}-${fallbackLang}`;
  if ((typeof submission[compositeFieldName] === 'string') && submission[compositeFieldName].length) return submission[compositeFieldName];
  return FALLBACK_TEXT;
};
