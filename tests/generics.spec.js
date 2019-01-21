const test = require('nefarious');
const { nil, union, record, isinstance, string, int, match, not, any } = require('..');

test('Generics', t => {
  const Just = T => T;
  const Nothing = nil;
  const Maybe = T => union(Just(T), Nothing);

  // prop: (obj, p) -> Maybe(obj[p])
  const prop = match(
    p => ({
      [record({ [p]: not(nil) })]: obj => obj[p],
    }),
    null
  );
  const get = match((prop, fallback = null) => ({
    [record({ [prop]: not(nil) })]: obj => obj[prop],
    [any]: fallback,
  }));
  const user = {
    username: 'foobar',
  };
  t.is(get(user, 'username'), 'foobar');
  t.is(get(user, 'meow', 5), 5);
  t.truthy(isinstance(prop(user, 'username'), Maybe(string)));
  t.truthy(isinstance(prop(user, 'xlsd'), Maybe(string)));

  const mapMaybe = match(mapper => ({
    [Just(string)]: mapper,
    [Nothing]: null,
  }));

  t.is(mapMaybe(prop(user, 'username'), username => username.length), 6);

  const Val = V => V;
  const Err = E => E;
  const Result = (E, V) => union(Val(V), Err(E));
  const wrap = fn => (...args) => {
    try {
      return fn(...args);
    } catch (e) {
      return e;
    }
  };
  const safeDeepProp = wrap((obj, props) =>
    props.reduce((val, p) => val[p], obj)
  );
  const hasDeepProp = (obj, props) =>
    match({
      [Err(Error)]: false,
      [Val(int)]: true,
    })(safeDeepProp(obj, props));
  t.falsy(hasDeepProp({}, ['a', 'b']));
  t.truthy(isinstance(safeDeepProp({}, ['a', 'b']), Result(Error, int)));
});
