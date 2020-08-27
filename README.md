# Schach - Parsing

**IMPORTANT:** this plugin is still in its early development stages, and
drastic API changes can (and probably will) occur without previous notice. We
do not recommend using it for actual plugins at the moment.

This plugin provides a core library with Parsing functionality.

**Example usage:**

```typescript
> let { parsed: expr } = Schach.Parsing.Arithmetic.expression().run("1 + 2 + 3 + 4 * 5 + 6")
< undefined

> Schach.Parsing.Arithmetic.evaluate(expr)
< 32
```


## Getting Started (Developers)

First of all, make sure you run `npm install` to install all the dependencies
for the project, such as [rollup.js](https://rollupjs.org/) and typescript.

Once you are done, `npm run build` will create a JS file for your plugin as
`dist/js/plugins/schach-parsing.js`.
