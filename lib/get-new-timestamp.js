'use strict';

const SEGMENT_SEPARATOR = '~';

module.exports = (fieldIdArg = '', langArg = '', modifierArg = '') => {
  let timestamp = (new Date()).toISOString();
  if (fieldIdArg) timestamp += `${SEGMENT_SEPARATOR}${fieldIdArg}`; // append (optional) fieldId
  if (langArg) timestamp += `${SEGMENT_SEPARATOR}${langArg}`; // append (optional) lang
  if (modifierArg) timestamp += `${SEGMENT_SEPARATOR}${modifierArg}`; // append (optional) modifier
  return timestamp;
};
