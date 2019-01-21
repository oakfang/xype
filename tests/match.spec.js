const test = require('nefarious');
const { optional, record, string, number, nil, int, match, typeby } = require('..');

const Person = record({
  name: string,
  age: optional(number),
});

const AgelessPerson = Person.extended({ age: nil });

test('Match', t => {
  const isEven = match(
    {
      [int]: x => !(x % 2),
    },
    false
  );
  t.is(isEven(1), false);
  t.is(isEven(2), true);
  t.is(isEven('2'), false);

  const getAge = match({ [AgelessPerson]: '-', [Person]: ({ age }) => age });

  const p = { name: 'foo', age: 3 };
  t.is(getAge(p), 3);
  delete p.age;
  t.is(getAge(p), '-');

  const factorial = match({
    [1]: 1,
    [int]: n => n * factorial(n - 1),
  });

  t.is(factorial(3), 6);

  const EmptyArray = typeby(arr => Array.isArray(arr) && arr.length === 0);

  const tail = match(
    {
      [EmptyArray]: [],
      [Array]: arr => arr.slice(1),
    },
    []
  );
  t.is(tail([1, 2])[0], 2);
  t.is(tail(0).length, 0);

  const strictFib = match({
    0: 1,
    1: 1,
    [int](x) {
      return strictFib(x - 1) + strictFib(x - 2);
    },
  });
  t.is(strictFib(4), 5);
  t.throws(() => strictFib('foo'));
});
