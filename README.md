dpd-js-sdk
==========

Use the deployd javascript sdk (dpd.js) anywhere you can run npm modules. It's not just for the browser anymore! Use convenient dpd.js syntax to query deployd APIs using nodejs.

## Install via npm

```Shell
$ npm install dpd-js-sdk
```

## Setup rootURL & baseURL (optional)

```JavaScript
var dpd = require('dpd-js-sdk')('http://www.yourDeploydDomain.com', '/api' );
```

## Usage

```JavaScript
var dpd = require('dpd-js-sdk')();
dpd.todos = dpd("/todos"); // you have to manually add your resources like so

dpd.todos.get(function(function(results, error) {
  //do something
});
```

Additional documentation for the dpd.js sdk can be found here:
http://docs.deployd.com/docs/collections/reference/dpd-js.md#s-Dpd.js

## How the sausage gets made:

Most of this code comes straight out of https://github.com/deployd/deployd/blob/master/clib/dpd.js

I have added a dependency on bluebird (for promises) and request (for sanity). Ajax requests made in the original clib/dpd.js are just replaced using promisified request.

I have also removed socket.io client stuff in here for now, since I think it would take some work to get it working...and because this is enough to suit my current need. (I am using this module as part of some express middleware to get data from remote deployd API).

As such, the  Realtime API features (documented here: http://docs.deployd.com/docs/collections/reference/dpd-js.md#s-Realtime%20API) do not work.

## Disclaimer

This module is untested, unauthorized, unlicenced, and unsupported. Use at your own discretion.
