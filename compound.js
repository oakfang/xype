const { isinstance, typeby } = require('./type-utils');
const { any, type, literal, union } = require('./meta');
const { nil, number, string, bool } = require('./primitives');

const Object_ = typeby(instance => instance && typeof instance === 'object');

const record = spec => {
  spec = reflectIntoCompoundType(spec, false);
  return class {
    static [Symbol.hasInstance](instance) {
      return (
        isinstance(instance, Object_) &&
        Object.keys(spec)
          .concat(Object.getOwnPropertySymbols(spec))
          .every(prop => isinstance(instance[prop], spec[prop]))
      );
    }
    static extended(xSpec) {
      return record(Object.assign({}, spec, xSpec));
    }
    static sanitise(object) {
      if (!isinstance(object, this)) {
        return null;
      }
      return Object.keys(spec)
        .concat(Object.getOwnPropertySymbols(spec))
        .reduce(
          (copy, prop) =>
            object[prop] !== undefined
              ? Object.assign(copy, {
                  [prop]: spec[prop].sanitise
                    ? spec[prop].sanitise(object[prop])
                    : object[prop],
                })
              : copy,
          {}
        );
    }
  };
};

const arrayOf = (type = any) => {
  type = reflectIntoCompoundType(type);
  return typeby(
    arr => Array.isArray(arr) && arr.every(e => isinstance(e, type))
  );
};

const tuple = (...values) => {
  values = values.map(reflectIntoCompoundType);
  return typeby(
    arr =>
      Array.isArray(arr) &&
      arr.length === values.length &&
      arr.reduce(
        (flag, value, idx) => flag && isinstance(value, values[idx]),
        true
      )
  );
};

function reflectIntoCompoundType(object, wrap = true) {
  if (Array.isArray(object)) {
    if (object.length > 1) {
      throw new Error('Reflecteed array can only have up to 1 type argument');
    }
    return arrayOf(object[0]);
  }
  if (isinstance(object, Object_) && !isinstance(object, type)) {
    const spec = Object.keys(object)
      .concat(Object.getOwnPropertySymbols(object))
      .reduce(
        (rec, prop) =>
          Object.assign(rec, { [prop]: reflectIntoCompoundType(object[prop]) }),
        {}
      );
    if (!wrap) return spec;
    return record(spec);
  }
  if (isinstance(object, union(nil, number, string, bool))) {
    return literal(object);
  }
  return object;
}

module.exports = { record, arrayOf, tuple, _reflect: reflectIntoCompoundType };
