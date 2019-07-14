'use strict';

const FALLBACK_TEXT = '';
const DELIMITER = '-';

module.exports = (submission, fieldName, lang = 'en', fallbackLang) => {
  // set up defaults
  const props = {
    lang: fallbackLang || lang,
    text: FALLBACK_TEXT,
  };
  if (!submission) return props;
  // try lang
  let compositeFieldName = `${fieldName}${DELIMITER}${lang}`;
  if ((typeof submission[compositeFieldName] === 'string') && submission[compositeFieldName].length) {
    props.lang = lang;
    props.text = submission[compositeFieldName];
    return props;
  }
  // try fallbackLang
  if (fallbackLang) {
    compositeFieldName = `${fieldName}${DELIMITER}${fallbackLang}`;
    if ((typeof submission[compositeFieldName] === 'string') && submission[compositeFieldName].length) {
      props.lang = fallbackLang;
      props.text = submission[compositeFieldName];
      return props;
    }
  }
  // try to find anything
  compositeFieldName = Object.keys(submission).find((k) => {
    const keyPrefix = `${fieldName}${DELIMITER}`;
    return (k.startsWith(keyPrefix) && (typeof submission[k] === 'string') && submission[k].length);
  });
  if (!compositeFieldName) return props;
  const [, foundLang] = compositeFieldName.split(DELIMITER);
  props.lang = foundLang;
  props.text = submission[compositeFieldName];
  return props;
};
