'use strict';

const INVALID_NUMBER_FALLBACK = '--Invalid Number--';

module.exports = (amount, formatOptions) => {
  if ((amount === null) || (amount === undefined)) return '';
  if ((typeof amount) !== 'number') return INVALID_NUMBER_FALLBACK;
  return (typeof formatOptions === 'object') ? amount.toLocaleString(undefined, formatOptions) : amount.toLocaleString();
};
