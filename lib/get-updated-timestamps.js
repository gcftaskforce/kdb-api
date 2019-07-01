'use strict';

const SEGMENT_SEPARATOR = '~';

module.exports = (timestampsArg = [], timestampArg = '') => {
  const [, fieldIdArg, langArg] = timestampArg.split(SEGMENT_SEPARATOR);
  const updatedTimestamps = [];
  let isUpdated = false;
  // Loop through existing timestamps, "copying" each to updatedTimestamps but also checking for the timestampArg so it can be used instead
  timestampsArg.forEach((string) => {
    const [, fieldId, lang] = string.split(SEGMENT_SEPARATOR);
    const isFound = (langArg) ? ((fieldId === fieldIdArg) && (lang === langArg)) : (fieldId === fieldIdArg);
    if (isFound) {
      // timestamp associated with fieldIdArg and (optional) langArg was found
      if (isUpdated) return; // this timestamp was already updated so skip it (this shouldn't happen)
      isUpdated = true; // set the flag
      // push the updated timestamp as a replacement
      updatedTimestamps.push(timestampArg);
      return; // we are done with this timestamp
    }
    // "copy" timestamp for other field to the updated timestamps array
    updatedTimestamps.push(string);
  });
  // field/lang is not in the existing timestamps (this is the first time it has been saved) so push it
  if (!isUpdated) updatedTimestamps.push(timestampArg);
  return updatedTimestamps.sort().reverse(); // sort in reverse-chronological order
};
