dpd-js-sdk
==========

Use the deployd javascript sdk (dpd.js) anywhere you can run npm modules. It's not just for the browser anymore! Use convenient dpd.js syntax to query deployd APIs using nodejs.

## Install via npm

```Shell
$ npm install dpd-js-sdk
```


## Setup

```JavaScript
var dpd = require('dpd-js-sdk')();
dpd.todos = dpd("/todos"); // you have to manually add your resources like so

dpd.todos.get()

```

## Set rootURL & baseURL (optional)
```JavaScript
var dpd = require('dpd-js-sdk')('http://www.yourDeploydDomain.com', '/api' );
````

