const { isinstance, getTypeByLabel } = require('./type-utils');
const { reflectIntoCompoundType } = require('./compound');
const { fn: Fn } = require('./primitives');

const getCallable = fn => (isinstance(fn, Fn) ? fn : () => fn);

const getType = typeAsString => {
  let type = getTypeByLabel(typeAsString);
  if (!type) {
    try {
      type = JSON.parse(typeAsString);
    } catch (_err) {
      type = typeAsString;
    }
  }
  return type;
};

function matchTo(val, matchers, fallback) {
  for (const [type, value] of Object.entries(matchers)) {
    if (isinstance(val, reflectIntoCompoundType(getType(type)))) {
      return getCallable(value)(val);
    }
  }
  if (fallback !== undefined) {
    return getCallable(fallback)(val);
  }
  throw new Error('No valid match was found, and no fallback was provided');
}

function match(...args) {
  const [mapper, fallback] = args;
  if (isinstance(mapper, Fn)) {
    return (base, ...matchArgs) =>
      matchTo(base, mapper(...matchArgs), fallback);
  }
  return val => matchTo(val, mapper, fallback);
}

module.exports = { match, matchTo };
