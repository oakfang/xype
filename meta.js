const { typeby, isinstance } = require("./type-utils");
const { nil } = require("./primitives");

const union = (...ofTypes) =>
  typeby(t => ofTypes.some(type => isinstance(t, type)));

const optional = Type => union(Type, nil);

const any = typeby(() => true);

const type = typeby(
  t =>
    t &&
    (typeof t === "function" || typeof t === "object") &&
    Symbol.hasInstance in t
);

const literal = value => typeby(t => t === value);

module.exports = { union, optional, any, type, literal };
