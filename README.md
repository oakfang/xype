# xype
Runtime JS type checking and matching

`xype` uses the new `Symbol.hasInstance` to create a robust solution for type-based code,
in the land of JavaScript.

## Install
`npm install --save xype`

## Usage
### Basic type-checking

```js
import { isinstance, primitives } from 'xype';
/*
primitives = {
  number(1, 2.3, NaN, ...),
  int(1, 2),
  float(1, 1.3),
  string('hello'),
  bool(true, false),
  nil(null, undefined)
}
isinstance = basically, instanceof as a function
*/

isinstance(3, primitives.number) // true
```

### Optional
`xype` introduces a new `optional<T>` type, which functions much like haskell's `Maybe<T>`.

```js
import { isinstance, primitives, optional } from 'xype';
const maybeNumber = optional(primitives.number);
isinstance(3, maybeNumber) // true
isinstance(null, maybeNumber) // true
isinstance('3', maybeNumber) // false
```

### Union
`xype` uses, and exposes, the `Union<...Ts>` type, which functions like the `type ZipCode = String | Number` declaration.

```js
import { isinstance, primitives, union } from 'xype';
const ZipCode = union(primitives.string, primitives.int);
isinstance(3, ZipCode) // true
isinstance(null, ZipCode) // false
isinstance('3', ZipCode) // true
```

### Records
```js
import { isinstance, primitives, optional, record, union } from 'xype';
const Person = record({
    name: primitives.string,
    age: optional(primitives.number),
});

// Records can be extended infinitely
const AgelessPerson = Person.extended({ age: primitives.nil });
const p = { name: 'Foo' };
isinstance(p, Person); // true
isinstance(p, AgelessPerson); // true
p.age = 4;
isinstance(p, Person); // true
isinstance(p, AgelessPerson); // false
delete p.name
isinstance(p, Person); // false
isinstance(p, AgelessPerson); // false

// Records are recursive
const Address = record({
    city: primitives.string,
    street: primitives.string,
    house: primitives.int,
    zip: optional(union(primitives.string, primitives.int)),
});
```

### Creating new types
```js
import { isinstance, typeby } from 'xype';
const EmptyArray = typeby(instance => Array.isArray(instance) && instance.length === 0);

isinstance([], EmptyArray) // true
isinstance([1], EmptyArray) // false
```

## Matching
`xype` exposes a relatively powerful matching function, aimimng to emulate haskell's pattern-matching capabilities.

The `match` function matches a type/primitive and maps it to a function/value.
Otherwise, see examples below:

```js
import { isinstance, primitives, optional, record, match } from 'xype';
const Person = record({
    name: primitives.string,
    age: optional(primitives.number),
});
const AgelessPerson = Person.extended({ age: primitives.nil });

const isEven = match(primitives.int, x => !(x % 2))
              .otherwise(false);
t.is(isEven(1), false);
t.is(isEven(2), true);
t.is(isEven('2'), false);

const getAge = match(AgelessPerson, '-')
                .match(Person, ({ age }) => age);

const p = { name: 'foo', age: 3 };
t.is(getAge(p), 3);
delete p.age;
t.is(getAge(p), '-');

const factorial = match(1, 1)
                    .match(primitives.int, n => n * factorial(n - 1));

t.is(factorial(3), 6);

const EmptyArray = typeby(arr => Array.isArray(arr) && arr.length === 0);

const tail = match(EmptyArray, [])
            .match(Array, arr => arr.slice(1))
            .otherwise([]);
t.is(tail([1, 2])[0], 2);
t.is(tail(0).length, 0);
```