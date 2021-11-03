# findium [![NPM version](https://img.shields.io/npm/v/findium.svg)](https://www.npmjs.com/package/findium) ![NPM](https://img.shields.io/npm/l/findium.svg) ![Travis](https://img.shields.io/travis/com/webdevium/findium.svg)

A simple library for converting google search results to JSON output.

## Install

`npm install -g findium`

## CLI usage

> Basic usage:

`findium --query="simple search"`

> Prevent display in the terminal, and save results to a JSON file:

`findium --query="simple search" -o results.json -n`

> Find and open the first 5 results in a browser:

`findium --query="simple search" -O 5`

> Find and show only URLs:

`findium --query="simple search" --only-urls`

### CLI options

- `--query`: the query that should be sent to the Google search
- `--include-sites`: option to limit results to comma-separated list of sites
- `--exclude-sites`: option to exclude results that appear in comma-separated list of sites
- `--limit`: number of search results to be returned
- `--only-urls`: only display the URLs, instead of the titles and snippets
- `--output`: name of the JSON file to save results to
- `--htmlFileOutputPath`: name of the HTML file to save results to
- `--no-display`: prevent results from terminal output. Should only be used when saving results to a file
- `--open`: opens the first X number of results in the browser after finishing query

### Use as a library

> `npm install --save findium`

```js
const findium = require('findium')

findium({query: 'simple search'}).then(results => {
    // access to results object here
}).catch(e => {
    // any possible errors (like no Internet connection)
})

// with axios request options
const options = {
    'proxy': {
        host: '127.0.0.1',
        port: 9000
    }
};
findium({options, query: 'simple search'}).then(results => {
    // access to results object here
}).catch(e => {
    // any possible errors (like no Internet connection)
})
```

## License

The `findium` is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
