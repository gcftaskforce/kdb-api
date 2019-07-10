'use strict';

const FALLBACK_TEXT = '';

module.exports = (submission, fieldName, lang = 'en', fallbackLang) => {
  const props = {
    lang: fallbackLang || lang,
    text: FALLBACK_TEXT,
  };
  if (!submission) return props;
  let compositeFieldName = `${fieldName}-${lang}`;
  if ((typeof submission[compositeFieldName] === 'string') && submission[compositeFieldName].length) {
    props.lang = lang;
    props.text = submission[compositeFieldName];
    return props;
  }
  if (!fallbackLang) return props;
  compositeFieldName = `${fieldName}-${fallbackLang}`;
  if ((typeof submission[compositeFieldName] === 'string') && submission[compositeFieldName].length) {
    props.lang = fallbackLang;
    props.text = submission[compositeFieldName];
    return props;
  }
  return props;
};
