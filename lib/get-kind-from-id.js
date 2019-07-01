'use strict';

const DELIMITER = '-';

module.exports = (id) => {
  const kind = id.split(DELIMITER)[0] || ''; // "kind" is just the first segment
  return kind.split('.')[0]; // previously there was a subtype modifier (e.g. text.html)
};
