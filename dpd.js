var Promise = require("bluebird");
var request = Promise.promisify(require('request'));
exports = module.exports = (function(rootURL, baseURL) {

// root default to localhost with deployd default port :2403
var root = "http://127.0.0.1:2403";
var BASE_URL = '/';

// overwrite rootURL and baseUrl as you choose
if(rootURL) root = rootURL;
if(baseURL) BASE_URL = baseURL;

  var consoleLog = (typeof console !== 'undefined') && console.log;

  function normalizeArray(parts, allowAboveRoot) {
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var last = parts[i];
      if (last == '.') {
        parts.splice(i, 1);
      } else if (last === '..') {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }

    // if the path is allowed to go above the root, restore leading ..
    if (allowAboveRoot) {
      for (; up--; up) {
        parts.unshift('..');
      }
    }

    return parts;
  }

  function filterArray(list, fn) {
    if (Array.prototype.filter) return Array.prototype.filter.call(list, fn);
    var newList = [];
    for (var i = 0; i < list.length; i++) {
      if (fn(list[i])) {
        newList.push(list[i]);
      }
    }
    return newList;
  }

  function joinPath() {
    var paths = Array.prototype.slice.call(arguments, 0);
    paths = paths.join('/').split('/');
    return '/' + filterArray(paths, function(p, index) {
      return p && typeof p === 'string';
    }).join('/');
  }

  function isComplex(obj) {
    if (obj) {
      for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
          if (typeof obj[k] !== 'string') {
            return true;
          }
        }
      }
    }
    return false;
  }

  function createQueryString(query) {
    var parts = [];
    for (var k in query) {
      if (query.hasOwnProperty(k)) {
        parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(query[k]));
      }
    }
    return parts.join('&');
  }

  function encodeIfComplex(query) {
    if (isComplex(query)) {
      return encodeURI(JSON.stringify(query));
    } else if (query) {
      return createQueryString(query);
    }
  }

  // function returnSuccess(fn) {
  //   return function(data) {
  //     if (fn === consoleLog) return console.log(data);
  //     if (typeof fn === 'function') fn(data);
  //   };
  // }

  // function returnError(fn) {
  //   return function(data) {
  //     if (fn === consoleLog) return console.error(data);
  //     if (typeof fn === 'function') fn(null, data);
  //   };
  // }



  function parseResponseBody(error, response, body) {
      if (!error && response.statusCode == 200) {
          console.log(JSON.parse(body));
      }
  }

  var baseMethods = {
    get: function(options, fn) {
      var query = encodeIfComplex(options.query);
      if (query) query = '?' + query;
      else query = '';

      return request({
          url: root + joinPath(BASE_URL, options.path) + query
        , method: "GET"
       }).spread(function(response, body) {
          fn(JSON.parse(body));
      }).catch(function(err) {
          fn(null, err);
      });
    }
    , del: function(options, fn) {
      var query = encodeIfComplex(options.query);
      if (query) query = '?' + query;
      else query = '';

      return request({
          url: root + joinPath(BASE_URL, options.path) + query
        , method: "DELETE"
      }).spread(function(response, body) {
          fn(JSON.parse(body));
      }).catch(function(err) {
          fn(null, err);
      });
    }
    , requestWithBody: function(method, options, fn) {
      var query = encodeIfComplex(options.query);
      if (query) query = '?' + query;
      else query = '';
      return request({
          url: root + joinPath(BASE_URL, options.path) + query
        , method: method
        , json: JSON.stringify(options.body || {}) || "{}"
      }).spread(function(response, body) {
          fn(JSON.parse(body));
      }).catch(function(err) {
          fn(null, err);
      });
    }
  };

  baseMethods.post = function(options, fn) {
    return baseMethods.requestWithBody("POST", options, fn);
  };

  baseMethods.put = function(options, fn) {
    return baseMethods.requestWithBody("PUT", options, fn);
  };


  function isString(arg) {
    return typeof arg === 'string' || typeof arg === 'number';
  }

  function toString(arg) {
    return arg ? arg.toString() : null;
  }

  function parseGetSignature(args) {
    var settings = {}
      , i = 0;

    // path/func
    if (isString(args[i]) || !args[i]) {
      settings.path = toString(args[i]);
      i++;
    }

    // join path to func
    if (isString(args[i])  || !args[i]) {
      settings.path = joinPath(settings.path, toString(args[i]));
      i++;
    }

    // query
    if (args[i] !== consoleLog && typeof args[i] === 'object' || !args[i]) { // IE considers console.log to be an object.
      settings.query = args[i];
      i++;
    }

    if (typeof args[i] === 'function' || args[i] === consoleLog) {
      settings.fn = args[i];
    }

    return settings;
}

  function parsePostSignature(args) {
    var settings = {}
      , i = 0;

    //path
    if (isString(args[i]) || !args[i]) {
      settings.path = toString(args[i]);
      i++;
    }

    // body
    if (args[i] !== consoleLog && typeof args[i] === 'object' || !args[i]) {
      settings.body = args[i];
      i++;
    }

    // query - if this exists the LAST obj was query and the new one is body
    if (args[i] !== consoleLog && typeof args[i] === 'object') {
      settings.query = settings.body;
      settings.body = args[i];
      i++;
    }

    if (typeof args[i] === 'function' || args[i] === consoleLog) {
      settings.fn = args[i];
    }

    return settings;
  }

dpd = function(resource) {
    var r = {
      get: function(func, path, query, fn) {
        var settings = parseGetSignature(arguments);
        settings.path = joinPath(resource, settings.path);

        return baseMethods.get(settings, settings.fn);
      }
      , post: function(path, query, body, fn) {
        var settings = parsePostSignature(arguments);
        settings.path = joinPath(resource, settings.path);

        return baseMethods.post(settings, settings.fn);
      }
      , put: function(path, query, body, fn) {
        var settings = parsePostSignature(arguments);
        settings.path = joinPath(resource, settings.path);

        return baseMethods.put(settings, settings.fn);
      }, del: function(path, query, fn) {
        var settings = parseGetSignature(arguments);
        settings.path = joinPath(resource, settings.path);

        return baseMethods.del(settings, settings.fn);
      }
    };

    r.exec = function(func, path, body, fn) {
      var settings = {}
        , i = 0;

      settings.func = arguments[i];
      i++;

      // path
      if (isString(arguments[i])) {
        settings.path = arguments[i];
        i++;
      }

      // body
      if (typeof arguments[i] === 'object') {
        settings.body = arguments[i];
        i++;
      }

      fn = arguments[i];

      settings.path = joinPath(resource, settings.func, settings.path);
      return baseMethods.post(settings, fn);
    };

    return r;
  };

  // just give me what I want!
  return dpd;
});
