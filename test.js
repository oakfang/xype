const test = require("nefarious");
const {
  optional,
  match,
  record,
  isinstance,
  primitives,
  typeby,
  v
} = require(".");

const Person = record({
  name: primitives.string,
  age: optional(primitives.number)
});

const Iterator = record({
  [Symbol.iterator]: Function,
});

const AgelessPerson = Person.extended({ age: primitives.nil });

// test("primitives", t => {
//   t.is(isinstance(1, primitives.number), true);
//   t.is(isinstance("1", primitives.number), false);
//   t.is(isinstance("foo", primitives.string), true);
//   t.is(isinstance(true, primitives.string), false);
//   t.is(isinstance(true, primitives.bool), true);
//   t.is(isinstance(false, primitives.bool), true);
//   t.is(isinstance("", primitives.bool), false);
//   t.is(isinstance(null, primitives.nil), true);
//   t.is(isinstance(undefined, primitives.nil), true);
//   t.is(isinstance(false, primitives.nil), false);
//   t.is(isinstance(1, primitives.int), true);
//   t.is(isinstance(1.4, primitives.int), false);
//   t.is(isinstance(1, primitives.float), true);
//   t.is(isinstance("1", primitives.float), false);
//   t.is(isinstance(1.4, primitives.float), true);
// });

// test("Optional", t => {
//   const maybeNum = optional(primitives.number);
//   t.is(isinstance(null, maybeNum), true);
//   t.is(isinstance(undefined, maybeNum), true);
//   t.is(isinstance(5, maybeNum), true);
//   t.is(isinstance("5", maybeNum), false);
// });

// test('Records', t => {
//     const p = { name: 'Foo' };
//     t.is(isinstance(p, Person), true);
//     t.is(isinstance(p, AgelessPerson), true);
//     p.age = 4;
//     t.is(isinstance(p, Person), true);
//     t.is(isinstance(p, AgelessPerson), false);
//     delete p.name;
//     t.is(isinstance(p, Person), false);
//     t.is(isinstance(p, AgelessPerson), false);
//     t.is(isinstance([], Iterator), true);
//     t.is(isinstance(new Set(), Iterator), true);
//     t.is(isinstance(p, Iterator), false);
// });

// test("Match", t => {
//   const isEven = match(primitives.int, x => !(x % 2)).otherwise(false);
//   t.is(isEven(1), false);
//   t.is(isEven(2), true);
//   t.is(isEven("2"), false);

//   const getAge = match(AgelessPerson, "-").match(Person, ({ age }) => age);

//   const p = { name: "foo", age: 3 };
//   t.is(getAge(p), 3);
//   delete p.age;
//   t.is(getAge(p), "-");

//   const factorial = match(1, 1).match(
//     primitives.int,
//     n => n * factorial(n - 1)
//   );

//   t.is(factorial(3), 6);

//   const EmptyArray = typeby(arr => Array.isArray(arr) && arr.length === 0);

//   const tail = match(EmptyArray, [])
//     .match(Array, arr => arr.slice(1))
//     .otherwise([]);
//   t.is(tail([1, 2])[0], 2);
//   t.is(tail(0).length, 0);
// });

test("Deep matching", t => {
  const sum = match([], 0).match(
    [v("x", primitives.number), ...v("xs")],
    ({ x, xs }) => x + sum(xs)
  );
  t.is(sum(1, 2, 3), 6);
  const counter = record({ count: primitives.int });
  const getCount = match({ count: 1 }, 1).match(counter, ({ count }) => {
    return (
      1 +
      getCount({
        count: count - 1
      })
    );
  });
  t.is(getCount({ count: 6 }), 7);
});
