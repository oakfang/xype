const test = require('nefarious');
const { optional, number, isinstance } = require('..');

test('Optional', t => {
  const maybeNum = optional(number);
  t.is(isinstance(null, maybeNum), true);
  t.is(isinstance(undefined, maybeNum), true);
  t.is(isinstance(5, maybeNum), true);
  t.is(isinstance('5', maybeNum), false);
});
