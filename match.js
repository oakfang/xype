const { isinstance } = require("./type-utils");
const { fn: Fn } = require("./primitives");
const { type: Type } = require("./meta");

const getCallable = fn => (isinstance(fn, Fn) ? fn : () => fn);

module.exports = function match(type, value) {
  const matchers = [{ type, value: getCallable(value) }];
  function _match(val) {
    for (const { type, value } of matchers) {
      if (type && isinstance(type, Type) && isinstance(val, type))
        return value(val);
      else if (type && val === type) return value(val);
      else if (!type) return value(val);
    }
  }
  _match.match = (type, value) => {
    matchers.push({ type, value: getCallable(value) });
    return _match;
  };
  _match.otherwise = value => _match.match(null, value);
  return _match;
};
