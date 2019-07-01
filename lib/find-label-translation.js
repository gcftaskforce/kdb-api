'use strict';

const MISSING_LABEL_FALLBACK = '--Missing Label--';

module.exports = (stringOrArray, lang = 'en', fallbackLang = 'en') => {
  if (stringOrArray === undefined) return '';
  if (typeof stringOrArray === 'string') return stringOrArray; // no translation
  if (!Array.isArray(stringOrArray)) return MISSING_LABEL_FALLBACK;
  let translation = stringOrArray.find(a => (a[0] === lang));
  // try fallback lang
  if ((translation === undefined) && (typeof fallbackLang === 'string')) translation = stringOrArray.find(a => (a[0] === fallbackLang));
  // missing label conditions
  if (translation === undefined) return MISSING_LABEL_FALLBACK;
  if (!Array.isArray(translation)) return MISSING_LABEL_FALLBACK;
  if (typeof translation[1] !== 'string') return MISSING_LABEL_FALLBACK;
  // found label
  return translation[1];
};
