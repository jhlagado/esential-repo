source

```js
const outer = (a, b) => {
  const c = 1;
  const d = 2;
  return (i, j) => {
    console.log(a, b, c, d);
  };
};
```

running

```js
const cls = outer(10, 20);
cls(100, 200);
```

output

```txt
10 20 1 2 100 200
```

transformed

```js
const init = (a, b) => {
  env.a = a;
  env.b = b;
  env.c = 1;
  env.d = 2;
}

const inner = (env, i, j) => {
  console.log(env.a, env.b, env.c, env.d, i, j);
};

const outer = (env, a, b) => {
  return tuple.make(inner,
    init(a,b),
    local.get(0),
    local.get(1),
    local.get(2),
    local.get(3),
  );
};

const env = [10, 20, 1, 2];
const outer = (inner, env) => ({ func, env });
```

```js
const callClosure = (closure, ...args) => {
  return closure.inner(closure.env, ...args);
};
```

```js
callClosure(closure, 100, 200);
```
