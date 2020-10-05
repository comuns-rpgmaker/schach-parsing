# Schach - Parsing

![Docs](https://github.com/comuns-rpgmaker/schach-parsing/workflows/Docs/badge.svg)
![Tests](https://github.com/comuns-rpgmaker/schach-parsing/workflows/Tests/badge.svg)
[![codecov](https://codecov.io/gh/comuns-rpgmaker/schach-parsing/branch/master/graph/badge.svg)](https://codecov.io/gh/comuns-rpgmaker/schach-parsing)

This plugin provides a core library with Parsing functionality.

**Example usage:**

```typescript
const { expression, evaluate } = Schach.Parsing.Arithmetic;

const { parsed: expr } = expression().run("#x^4 - log2(#y)")

evaluate(expr, { variables: { x: 5, y: 32 } })
// returns 5^4 - log2(32) = 625 - 5 = 620
```


## Getting Started (Developers)

First of all, make sure you run `npm install` to install all the dependencies
for the project, such as [rollup.js](https://rollupjs.org/) and typescript.

Once you are done, `npm run build` will create a JS file for your plugin as
`dist/js/plugins/schach-parsing.js`.
