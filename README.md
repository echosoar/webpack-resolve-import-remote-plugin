# webpack-resolve-import-remote-plugin

import dependencies in js like golang!

## Usage

```
// You can import repo from remote address

import dlv from 'github.com/developit/dlv';

const name = dlv(
  {
    type: {
      name: 'WebpackIRPlugin'
    }
  },
  'type.name'
);

console.log(name);

// WebpackIRPlugin


```

## Installation

`npm install --save-dev webpack-resolve-import-remote-plugin`

For webpack.config.js:
```
const WebpackIRPlugin = require('webpack-resolve-import-remote-plugin');

....
resolve: {
  plugins: [
    new WebpackIRPlugin()
  ]
}
....

```

