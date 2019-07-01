'use strict';

const validator = require('validator');

module.exports = (arg) => {
  let possibleNumberString = arg.trim();
  if (possibleNumberString === '') return null;
  if (validator.isNumeric(possibleNumberString)) return Number.parseFloat(possibleNumberString);
  // deal with thousand separators
  const [whole, frac] = possibleNumberString.split('.');
  if ((frac !== undefined) && frac.includes(',')) return NaN; // string is invalid because there's a thousand separator in frac
  const segments = whole.split(',');
  if (segments.length === 1) return NaN; // there aren't any thousand separators so the string is invalid for some other reason
  let firstSegment = segments.shift();
  if (firstSegment.startsWith('-') || firstSegment.startsWith('+')) firstSegment = firstSegment.substring(1).trim();
  if ((firstSegment.length === 0) || (firstSegment.length > 3)) return NaN;
  if (segments.some(e => (e.length !== 3))) return NaN;
  // thousand separators are ok so remove them and recheck with validator
  possibleNumberString = possibleNumberString.replace(/,/g, '');
  if (validator.isNumeric(possibleNumberString)) return Number.parseFloat(possibleNumberString);
  return NaN; // we tried our best
};
