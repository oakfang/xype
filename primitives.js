const { typeby } = require("./type-utils");

const nil = typeby(val => val == null);
const Primitive = type => typeby(val => typeof val === type);

module.exports = {
  string: Primitive("string"),
  number: Primitive("number"),
  bool: Primitive("boolean"),
  fn: Primitive("function"),
  int: typeby(Number.isInteger),
  float: typeby(Number.isFinite),
  nil
};
