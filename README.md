Node.js require directory module
================================

Installation
------------

```
npm install dirreq
```

Usage
-----

```javascript
var dirreq = require('dirreq');
var requiredObject = dirreq(relativePath, options);
```

Options
-------

```javascript
{
  debug: Boolean, default false
  defer: Boolean, default true
  extensions: Array, default Object.keys(require.extensions)
  onlyFiles: Boolean, default true
  recursive: Boolean, default false
  requireFunction: Function, default require
  stripExtension: Boolean, default true
}
```

* `debug`: if set to `true`, will output debug information to stdout about skipped files and directories
* `defer`: if set to `true`, will call the require function only when accessed via `requiredDirectory.field`
* `extensions`: accepted file extensions. By default, `.js`, `.json` and `.node` are accepted
* `onlyFiles`: if set to `true` and `recursive` option is not set, will skip directories (i.e. not call the require function on anything that doesn't comply to `fs.statSync(path).isFile()`)
* `recursive`: if set to `true`, will also require directories inside the given base directory
* `requireFunction`: if set, will call this function instead of the default `require()`
* `stripExtension`: if set to `true`, will remove extension in the field name in the returned object


Example
-------

```
test
|
+-+ test
  |
  +- nested.js
+- test1.js
+- test2.js
+- test3.txt
```

### Default
```javascript
var dirreq = require('dirreq');
var dirs = dirreq('./test');

console.log(dirs);
/*
{ test: { nested: { nested: [Function] } },
  test1: [Function],
  test2: {} }
*/
```

### Defer and no recursion
```javascript
var dirreq = require('dirreq');
var dirs = dirreq('./test', {
    defer: true,
    recursive: false,
});

console.log(dirs);
/*
{ test1: [Getter], test2: [Getter] }
*/
```

- - - -

Concerns
--------

When loading files recursively (`options.recurse` set to `true`), the original directory structure will be kept.
