const test = require('nefarious');
const { optional, union, record, isinstance, string, int } = require('..');

test('Reflect entire schema', t => {
  const User = record({
    username: string,
    address: {
      city: string,
      street: string,
      house: int,
      zip: optional(union(string, int)),
    },
    comments: [
      {
        content: string,
      },
    ],
  });
  t.is(
    isinstance(
      {
        username: 'foo',
        address: {
          city: 'x',
          street: 'y',
          house: 4,
        },
        comments: [{ content: 'foo' }],
      },
      User
    ),
    true
  );
  t.is(
    isinstance(
      {
        username: 'foo',
        address: {
          city: 'x',
          street: 'y',
          house: 4,
        },
        comments: [{ contents: 'foo' }],
      },
      User
    ),
    false
  );
  t.throws(() =>
    record({
      foo: [int, string],
    })
  );
  t.is(
    isinstance(
      {
        values: [1, '2'],
      },
      record({
        values: [],
      })
    ),
    true
  );
});

test('Reflection of literals', t => {
  const T = record({
    age: 34,
  });
  t.is(isinstance({ age: 34 }, T), true);
  t.is(isinstance({ age: 33 }, T), false);
});
