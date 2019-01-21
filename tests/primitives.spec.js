const test = require('nefarious');
const { isinstance, bool, string, number, nil, float, int } = require('..');

test('primitives', t => {
  t.is(isinstance(1, number), true);
  t.is(isinstance('1', number), false);
  t.is(isinstance('foo', string), true);
  t.is(isinstance(true, string), false);
  t.is(isinstance(true, bool), true);
  t.is(isinstance(false, bool), true);
  t.is(isinstance('', bool), false);
  t.is(isinstance(null, nil), true);
  t.is(isinstance(undefined, nil), true);
  t.is(isinstance(false, nil), false);
  t.is(isinstance(1, int), true);
  t.is(isinstance(1.4, int), false);
  t.is(isinstance(1, float), true);
  t.is(isinstance('1', float), false);
  t.is(isinstance(1.4, float), true);
});
