const { isinstance, getTypeByLabel } = require('./type-utils');
const { _reflect } = require('./compound');
const { fn: Fn } = require('./primitives');

const getCallable = fn => (isinstance(fn, Fn) ? fn : () => fn);

const getType = typeAsString => {
  const byLabel = getTypeByLabel(typeAsString);
  return byLabel ? byLabel : JSON.parse(typeAsString);
};

module.exports = function match(matchers, fallback) {
  return val => {
    for (const [type, value] of Object.entries(matchers)) {
      if (isinstance(val, _reflect(getType(type)))) {
        return getCallable(value)(val);
      }
    }
    if (fallback !== undefined) {
      return getCallable(fallback)(val);
    }
    throw new Error('No valid match was found, and no fallback was provided');
  };
};
