let __defineProperty = Object.defineProperty;
let __hasOwnProperty = Object.prototype.hasOwnProperty;
let __getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
let __commonJS = (callback, module) => () => {
  if (!module) {
    module = {exports: {}};
    callback(module.exports, module);
  }
  return module.exports;
};
let __markAsModule = (target) => {
  return __defineProperty(target, "__esModule", {value: true});
};
let __export = (target, all) => {
  __markAsModule(target);
  for (let name in all)
    __defineProperty(target, name, {get: all[name], enumerable: true});
};
let __exportStar = (target, module) => {
  __markAsModule(target);
  for (let key2 in module)
    if (__hasOwnProperty.call(module, key2) && !__hasOwnProperty.call(target, key2) && key2 !== "default")
      __defineProperty(target, key2, {get: () => module[key2], enumerable: true});
  return target;
};
let __toModule = (module) => {
  if (module && module.__esModule)
    return module;
  return __exportStar(__defineProperty({}, "default", {value: module, enumerable: true}), module);
};
let __decorate = (decorators4, target, key2, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropertyDescriptor(target, key2) : target;
  for (var i = decorators4.length - 1, decorator2; i >= 0; i--)
    if (decorator2 = decorators4[i])
      result = (kind ? decorator2(target, key2, result) : decorator2(result)) || result;
  if (kind && result)
    __defineProperty(target, key2, result);
  return result;
};

// node_modules/isobject/index.js
var require_isobject = __commonJS((exports, module) => {
  "use strict";
  module.exports = function isObject(val) {
    return val != null && typeof val === "object" && Array.isArray(val) === false;
  };
});

// node_modules/get-value/index.js
var require_get_value = __commonJS((exports, module) => {
  const isObject = require_isobject();
  module.exports = function(target, path4, options) {
    if (!isObject(options)) {
      options = {default: options};
    }
    if (!isValidObject(target)) {
      return typeof options.default !== "undefined" ? options.default : target;
    }
    if (typeof path4 === "number") {
      path4 = String(path4);
    }
    const isArray2 = Array.isArray(path4);
    const isString = typeof path4 === "string";
    const splitChar = options.separator || ".";
    const joinChar = options.joinChar || (typeof splitChar === "string" ? splitChar : ".");
    if (!isString && !isArray2) {
      return target;
    }
    if (isString && path4 in target) {
      return isValid11(path4, target, options) ? target[path4] : options.default;
    }
    let segs = isArray2 ? path4 : split(path4, splitChar, options);
    let len = segs.length;
    let idx = 0;
    do {
      let prop = segs[idx];
      if (typeof prop === "number") {
        prop = String(prop);
      }
      while (prop && prop.slice(-1) === "\\") {
        prop = join([prop.slice(0, -1), segs[++idx] || ""], joinChar, options);
      }
      if (prop in target) {
        if (!isValid11(prop, target, options)) {
          return options.default;
        }
        target = target[prop];
      } else {
        let hasProp = false;
        let n = idx + 1;
        while (n < len) {
          prop = join([prop, segs[n++]], joinChar, options);
          if (hasProp = prop in target) {
            if (!isValid11(prop, target, options)) {
              return options.default;
            }
            target = target[prop];
            idx = n - 1;
            break;
          }
        }
        if (!hasProp) {
          return options.default;
        }
      }
    } while (++idx < len && isValidObject(target));
    if (idx === len) {
      return target;
    }
    return options.default;
  };
  function join(segs, joinChar, options) {
    if (typeof options.join === "function") {
      return options.join(segs);
    }
    return segs[0] + joinChar + segs[1];
  }
  function split(path4, splitChar, options) {
    if (typeof options.split === "function") {
      return options.split(path4);
    }
    return path4.split(splitChar);
  }
  function isValid11(key2, target, options) {
    if (typeof options.isValid === "function") {
      return options.isValid(key2, target);
    }
    return true;
  }
  function isValidObject(val) {
    return isObject(val) || Array.isArray(val) || typeof val === "function";
  }
});

// node_modules/is-plain-object/index.js
var require_is_plain_object = __commonJS((exports, module) => {
  "use strict";
  var isObject = require_isobject();
  function isObjectObject(o) {
    return isObject(o) === true && Object.prototype.toString.call(o) === "[object Object]";
  }
  module.exports = function isPlainObject(o) {
    var ctor, prot;
    if (isObjectObject(o) === false)
      return false;
    ctor = o.constructor;
    if (typeof ctor !== "function")
      return false;
    prot = ctor.prototype;
    if (isObjectObject(prot) === false)
      return false;
    if (prot.hasOwnProperty("isPrototypeOf") === false) {
      return false;
    }
    return true;
  };
});

// node_modules/set-value/index.js
var require_set_value = __commonJS((exports, module) => {
  "use strict";
  const isPlain = require_is_plain_object();
  function set5(target, path4, value, options) {
    if (!isObject(target)) {
      return target;
    }
    let opts = options || {};
    const isArray2 = Array.isArray(path4);
    if (!isArray2 && typeof path4 !== "string") {
      return target;
    }
    let merge = opts.merge;
    if (merge && typeof merge !== "function") {
      merge = Object.assign;
    }
    const keys2 = (isArray2 ? path4 : split(path4, opts)).filter(isValidKey);
    const len = keys2.length;
    const orig = target;
    if (!options && keys2.length === 1) {
      result(target, keys2[0], value, merge);
      return target;
    }
    for (let i = 0; i < len; i++) {
      let prop = keys2[i];
      if (!isObject(target[prop])) {
        target[prop] = {};
      }
      if (i === len - 1) {
        result(target, prop, value, merge);
        break;
      }
      target = target[prop];
    }
    return orig;
  }
  function result(target, path4, value, merge) {
    if (merge && isPlain(target[path4]) && isPlain(value)) {
      target[path4] = merge({}, target[path4], value);
    } else {
      target[path4] = value;
    }
  }
  function split(path4, options) {
    const id = createKey(path4, options);
    if (set5.memo[id])
      return set5.memo[id];
    const char = options && options.separator ? options.separator : ".";
    let keys2 = [];
    let res = [];
    if (options && typeof options.split === "function") {
      keys2 = options.split(path4);
    } else {
      keys2 = path4.split(char);
    }
    for (let i = 0; i < keys2.length; i++) {
      let prop = keys2[i];
      while (prop && prop.slice(-1) === "\\" && keys2[i + 1] != null) {
        prop = prop.slice(0, -1) + char + keys2[++i];
      }
      res.push(prop);
    }
    set5.memo[id] = res;
    return res;
  }
  function createKey(pattern, options) {
    let id = pattern;
    if (typeof options === "undefined") {
      return id + "";
    }
    const keys2 = Object.keys(options);
    for (let i = 0; i < keys2.length; i++) {
      const key2 = keys2[i];
      id += ";" + key2 + "=" + String(options[key2]);
    }
    return id;
  }
  function isValidKey(key2) {
    return key2 !== "__proto__" && key2 !== "constructor" && key2 !== "prototype";
  }
  function isObject(val) {
    return val !== null && (typeof val === "object" || typeof val === "function");
  }
  set5.memo = {};
  module.exports = set5;
});

// node_modules/lodash.get/index.js
var require_lodash = __commonJS((exports, module) => {
  var FUNC_ERROR_TEXT = "Expected a function";
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  var INFINITY = 1 / 0;
  var funcTag = "[object Function]";
  var genTag = "[object GeneratorFunction]";
  var symbolTag = "[object Symbol]";
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
  var reIsPlainProp = /^\w*$/;
  var reLeadingDot = /^\./;
  var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var reEscapeChar = /\\(\\)?/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root = freeGlobal || freeSelf || Function("return this")();
  function getValue(object, key2) {
    return object == null ? void 0 : object[key2];
  }
  function isHostObject(value) {
    var result = false;
    if (value != null && typeof value.toString != "function") {
      try {
        result = !!(value + "");
      } catch (e) {
      }
    }
    return result;
  }
  var arrayProto = Array.prototype;
  var funcProto = Function.prototype;
  var objectProto = Object.prototype;
  var coreJsData = root["__core-js_shared__"];
  var maskSrcKey = function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
    return uid ? "Symbol(src)_1." + uid : "";
  }();
  var funcToString = funcProto.toString;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var objectToString = objectProto.toString;
  var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
  var Symbol2 = root.Symbol;
  var splice = arrayProto.splice;
  var Map2 = getNative(root, "Map");
  var nativeCreate = getNative(Object, "create");
  var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
  var symbolToString = symbolProto ? symbolProto.toString : void 0;
  function Hash(entries) {
    var index10 = -1, length2 = entries ? entries.length : 0;
    this.clear();
    while (++index10 < length2) {
      var entry = entries[index10];
      this.set(entry[0], entry[1]);
    }
  }
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
  }
  function hashDelete(key2) {
    return this.has(key2) && delete this.__data__[key2];
  }
  function hashGet(key2) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key2];
      return result === HASH_UNDEFINED ? void 0 : result;
    }
    return hasOwnProperty.call(data, key2) ? data[key2] : void 0;
  }
  function hashHas(key2) {
    var data = this.__data__;
    return nativeCreate ? data[key2] !== void 0 : hasOwnProperty.call(data, key2);
  }
  function hashSet(key2, value) {
    var data = this.__data__;
    data[key2] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
    return this;
  }
  Hash.prototype.clear = hashClear;
  Hash.prototype["delete"] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;
  function ListCache(entries) {
    var index10 = -1, length2 = entries ? entries.length : 0;
    this.clear();
    while (++index10 < length2) {
      var entry = entries[index10];
      this.set(entry[0], entry[1]);
    }
  }
  function listCacheClear() {
    this.__data__ = [];
  }
  function listCacheDelete(key2) {
    var data = this.__data__, index10 = assocIndexOf(data, key2);
    if (index10 < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index10 == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index10, 1);
    }
    return true;
  }
  function listCacheGet(key2) {
    var data = this.__data__, index10 = assocIndexOf(data, key2);
    return index10 < 0 ? void 0 : data[index10][1];
  }
  function listCacheHas(key2) {
    return assocIndexOf(this.__data__, key2) > -1;
  }
  function listCacheSet(key2, value) {
    var data = this.__data__, index10 = assocIndexOf(data, key2);
    if (index10 < 0) {
      data.push([key2, value]);
    } else {
      data[index10][1] = value;
    }
    return this;
  }
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype["delete"] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;
  function MapCache(entries) {
    var index10 = -1, length2 = entries ? entries.length : 0;
    this.clear();
    while (++index10 < length2) {
      var entry = entries[index10];
      this.set(entry[0], entry[1]);
    }
  }
  function mapCacheClear() {
    this.__data__ = {
      hash: new Hash(),
      map: new (Map2 || ListCache)(),
      string: new Hash()
    };
  }
  function mapCacheDelete(key2) {
    return getMapData(this, key2)["delete"](key2);
  }
  function mapCacheGet(key2) {
    return getMapData(this, key2).get(key2);
  }
  function mapCacheHas(key2) {
    return getMapData(this, key2).has(key2);
  }
  function mapCacheSet(key2, value) {
    getMapData(this, key2).set(key2, value);
    return this;
  }
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype["delete"] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;
  function assocIndexOf(array, key2) {
    var length2 = array.length;
    while (length2--) {
      if (eq(array[length2][0], key2)) {
        return length2;
      }
    }
    return -1;
  }
  function baseGet(object, path4) {
    path4 = isKey(path4, object) ? [path4] : castPath(path4);
    var index10 = 0, length2 = path4.length;
    while (object != null && index10 < length2) {
      object = object[toKey(path4[index10++])];
    }
    return index10 && index10 == length2 ? object : void 0;
  }
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }
  function baseToString(value) {
    if (typeof value == "string") {
      return value;
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : "";
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }
  function castPath(value) {
    return isArray2(value) ? value : stringToPath(value);
  }
  function getMapData(map, key2) {
    var data = map.__data__;
    return isKeyable(key2) ? data[typeof key2 == "string" ? "string" : "hash"] : data.map;
  }
  function getNative(object, key2) {
    var value = getValue(object, key2);
    return baseIsNative(value) ? value : void 0;
  }
  function isKey(value, object) {
    if (isArray2(value)) {
      return false;
    }
    var type = typeof value;
    if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
      return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
  }
  function isKeyable(value) {
    var type = typeof value;
    return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
  }
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }
  var stringToPath = memoize(function(string) {
    string = toString2(string);
    var result = [];
    if (reLeadingDot.test(string)) {
      result.push("");
    }
    string.replace(rePropName, function(match3, number, quote, string2) {
      result.push(quote ? string2.replace(reEscapeChar, "$1") : number || match3);
    });
    return result;
  });
  function toKey(value) {
    if (typeof value == "string" || isSymbol(value)) {
      return value;
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {
      }
      try {
        return func + "";
      } catch (e) {
      }
    }
    return "";
  }
  function memoize(func, resolver) {
    if (typeof func != "function" || resolver && typeof resolver != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments, key2 = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
      if (cache.has(key2)) {
        return cache.get(key2);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key2, result);
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache)();
    return memoized;
  }
  memoize.Cache = MapCache;
  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }
  var isArray2 = Array.isArray;
  function isFunction(value) {
    var tag = isObject(value) ? objectToString.call(value) : "";
    return tag == funcTag || tag == genTag;
  }
  function isObject(value) {
    var type = typeof value;
    return !!value && (type == "object" || type == "function");
  }
  function isObjectLike(value) {
    return !!value && typeof value == "object";
  }
  function isSymbol(value) {
    return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
  }
  function toString2(value) {
    return value == null ? "" : baseToString(value);
  }
  function get4(object, path4, defaultValue2) {
    var result = object == null ? void 0 : baseGet(object, path4);
    return result === void 0 ? defaultValue2 : result;
  }
  module.exports = get4;
});

// node_modules/fast-deep-equal/index.js
var require_fast_deep_equal = __commonJS((exports, module) => {
  "use strict";
  module.exports = function equal2(a, b) {
    if (a === b)
      return true;
    if (a && b && typeof a == "object" && typeof b == "object") {
      if (a.constructor !== b.constructor)
        return false;
      var length2, i, keys2;
      if (Array.isArray(a)) {
        length2 = a.length;
        if (length2 != b.length)
          return false;
        for (i = length2; i-- !== 0; )
          if (!equal2(a[i], b[i]))
            return false;
        return true;
      }
      if (a.constructor === RegExp)
        return a.source === b.source && a.flags === b.flags;
      if (a.valueOf !== Object.prototype.valueOf)
        return a.valueOf() === b.valueOf();
      if (a.toString !== Object.prototype.toString)
        return a.toString() === b.toString();
      keys2 = Object.keys(a);
      length2 = keys2.length;
      if (length2 !== Object.keys(b).length)
        return false;
      for (i = length2; i-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(b, keys2[i]))
          return false;
      for (i = length2; i-- !== 0; ) {
        var key2 = keys2[i];
        if (!equal2(a[key2], b[key2]))
          return false;
      }
      return true;
    }
    return a !== a && b !== b;
  };
});

// node_modules/fast-copy/dist/fast-copy.js
var require_fast_copy = __commonJS((exports, module) => {
  (function(global2, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global2 = global2 || self, global2["fast-copy"] = factory());
  })(exports, function() {
    "use strict";
    var toStringFunction = Function.prototype.toString;
    var create = Object.create, defineProperty2 = Object.defineProperty, getOwnPropertyDescriptor2 = Object.getOwnPropertyDescriptor, getOwnPropertyNames = Object.getOwnPropertyNames, getOwnPropertySymbols = Object.getOwnPropertySymbols, getPrototypeOf = Object.getPrototypeOf;
    var _a2 = Object.prototype, hasOwnProperty = _a2.hasOwnProperty, propertyIsEnumerable = _a2.propertyIsEnumerable;
    var SUPPORTS = {
      SYMBOL_PROPERTIES: typeof getOwnPropertySymbols === "function",
      WEAKMAP: typeof WeakMap === "function"
    };
    var createCache = function() {
      if (SUPPORTS.WEAKMAP) {
        return new WeakMap();
      }
      var object = create({
        has: function(key2) {
          return !!~object._keys.indexOf(key2);
        },
        set: function(key2, value) {
          object._keys.push(key2);
          object._values.push(value);
        },
        get: function(key2) {
          return object._values[object._keys.indexOf(key2)];
        }
      });
      object._keys = [];
      object._values = [];
      return object;
    };
    var getCleanClone = function(object, realm) {
      if (!object.constructor) {
        return create(null);
      }
      var Constructor = object.constructor;
      var prototype = object.__proto__ || getPrototypeOf(object);
      if (Constructor === realm.Object) {
        return prototype === realm.Object.prototype ? {} : create(prototype);
      }
      if (~toStringFunction.call(Constructor).indexOf("[native code]")) {
        try {
          return new Constructor();
        } catch (_a3) {
        }
      }
      return create(prototype);
    };
    var getObjectCloneLoose = function(object, realm, handleCopy, cache) {
      var clone = getCleanClone(object, realm);
      cache.set(object, clone);
      for (var key2 in object) {
        if (hasOwnProperty.call(object, key2)) {
          clone[key2] = handleCopy(object[key2], cache);
        }
      }
      if (SUPPORTS.SYMBOL_PROPERTIES) {
        var symbols = getOwnPropertySymbols(object);
        var length_1 = symbols.length;
        if (length_1) {
          for (var index10 = 0, symbol = void 0; index10 < length_1; index10++) {
            symbol = symbols[index10];
            if (propertyIsEnumerable.call(object, symbol)) {
              clone[symbol] = handleCopy(object[symbol], cache);
            }
          }
        }
      }
      return clone;
    };
    var getObjectCloneStrict = function(object, realm, handleCopy, cache) {
      var clone = getCleanClone(object, realm);
      cache.set(object, clone);
      var properties = SUPPORTS.SYMBOL_PROPERTIES ? getOwnPropertyNames(object).concat(getOwnPropertySymbols(object)) : getOwnPropertyNames(object);
      var length2 = properties.length;
      if (length2) {
        for (var index10 = 0, property2 = void 0, descriptor = void 0; index10 < length2; index10++) {
          property2 = properties[index10];
          if (property2 !== "callee" && property2 !== "caller") {
            descriptor = getOwnPropertyDescriptor2(object, property2);
            descriptor.value = handleCopy(object[property2], cache);
            defineProperty2(clone, property2, descriptor);
          }
        }
      }
      return clone;
    };
    var getRegExpFlags = function(regExp) {
      var flags = "";
      if (regExp.global) {
        flags += "g";
      }
      if (regExp.ignoreCase) {
        flags += "i";
      }
      if (regExp.multiline) {
        flags += "m";
      }
      if (regExp.unicode) {
        flags += "u";
      }
      if (regExp.sticky) {
        flags += "y";
      }
      return flags;
    };
    var isArray2 = Array.isArray;
    var GLOBAL_THIS = function() {
      if (typeof self !== "undefined") {
        return self;
      }
      if (typeof window !== "undefined") {
        return window;
      }
      if (typeof global !== "undefined") {
        return global;
      }
      if (console && console.error) {
        console.error('Unable to locate global object, returning "this".');
      }
    }();
    function copy2(object, options) {
      var isStrict = !!(options && options.isStrict);
      var realm = options && options.realm || GLOBAL_THIS;
      var getObjectClone = isStrict ? getObjectCloneStrict : getObjectCloneLoose;
      var handleCopy = function(object2, cache) {
        if (!object2 || typeof object2 !== "object") {
          return object2;
        }
        if (cache.has(object2)) {
          return cache.get(object2);
        }
        var Constructor = object2.constructor;
        if (Constructor === realm.Object) {
          return getObjectClone(object2, realm, handleCopy, cache);
        }
        var clone;
        if (isArray2(object2)) {
          if (isStrict) {
            return getObjectCloneStrict(object2, realm, handleCopy, cache);
          }
          var length_1 = object2.length;
          clone = new Constructor();
          cache.set(object2, clone);
          for (var index10 = 0; index10 < length_1; index10++) {
            clone[index10] = handleCopy(object2[index10], cache);
          }
          return clone;
        }
        if (object2 instanceof realm.Date) {
          return new Constructor(object2.getTime());
        }
        if (object2 instanceof realm.RegExp) {
          clone = new Constructor(object2.source, object2.flags || getRegExpFlags(object2));
          clone.lastIndex = object2.lastIndex;
          return clone;
        }
        if (realm.Map && object2 instanceof realm.Map) {
          clone = new Constructor();
          cache.set(object2, clone);
          object2.forEach(function(value, key2) {
            clone.set(key2, handleCopy(value, cache));
          });
          return clone;
        }
        if (realm.Set && object2 instanceof realm.Set) {
          clone = new Constructor();
          cache.set(object2, clone);
          object2.forEach(function(value) {
            clone.add(handleCopy(value, cache));
          });
          return clone;
        }
        if (realm.Buffer && realm.Buffer.isBuffer(object2)) {
          clone = realm.Buffer.allocUnsafe ? realm.Buffer.allocUnsafe(object2.length) : new Constructor(object2.length);
          cache.set(object2, clone);
          object2.copy(clone);
          return clone;
        }
        if (realm.ArrayBuffer) {
          if (realm.ArrayBuffer.isView(object2)) {
            clone = new Constructor(object2.buffer.slice(0));
            cache.set(object2, clone);
            return clone;
          }
          if (object2 instanceof realm.ArrayBuffer) {
            clone = object2.slice(0);
            cache.set(object2, clone);
            return clone;
          }
        }
        if (typeof object2.then === "function" || object2 instanceof Error || realm.WeakMap && object2 instanceof realm.WeakMap || realm.WeakSet && object2 instanceof realm.WeakSet) {
          return object2;
        }
        return getObjectClone(object2, realm, handleCopy, cache);
      };
      return handleCopy(object, createCache());
    }
    copy2.strict = function strictCopy(object, options) {
      return copy2(object, {
        isStrict: true,
        realm: options ? options.realm : void 0
      });
    };
    return copy2;
  });
});

// node_modules/pluralize/pluralize.js
var require_pluralize = __commonJS((exports, module) => {
  (function(root, pluralize2) {
    if (typeof exports === "object" && typeof module === "object") {
      module.exports = pluralize2();
    } else if (typeof define === "function" && define.amd) {
      define(function() {
        return pluralize2();
      });
    } else {
      root.pluralize = pluralize2();
    }
  })(exports, function() {
    var pluralRules = [];
    var singularRules = [];
    var uncountables = {};
    var irregularPlurals = {};
    var irregularSingles = {};
    function sanitizeRule(rule) {
      if (typeof rule === "string") {
        return new RegExp("^" + rule + "$", "i");
      }
      return rule;
    }
    function restoreCase(word, token) {
      if (word === token)
        return token;
      if (word === word.toLowerCase())
        return token.toLowerCase();
      if (word === word.toUpperCase())
        return token.toUpperCase();
      if (word[0] === word[0].toUpperCase()) {
        return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
      }
      return token.toLowerCase();
    }
    function interpolate(str, args) {
      return str.replace(/\$(\d{1,2})/g, function(match3, index10) {
        return args[index10] || "";
      });
    }
    function replace(word, rule) {
      return word.replace(rule[0], function(match3, index10) {
        var result = interpolate(rule[1], arguments);
        if (match3 === "") {
          return restoreCase(word[index10 - 1], result);
        }
        return restoreCase(match3, result);
      });
    }
    function sanitizeWord(token, word, rules) {
      if (!token.length || uncountables.hasOwnProperty(token)) {
        return word;
      }
      var len = rules.length;
      while (len--) {
        var rule = rules[len];
        if (rule[0].test(word))
          return replace(word, rule);
      }
      return word;
    }
    function replaceWord(replaceMap, keepMap, rules) {
      return function(word) {
        var token = word.toLowerCase();
        if (keepMap.hasOwnProperty(token)) {
          return restoreCase(word, token);
        }
        if (replaceMap.hasOwnProperty(token)) {
          return restoreCase(word, replaceMap[token]);
        }
        return sanitizeWord(token, word, rules);
      };
    }
    function checkWord(replaceMap, keepMap, rules, bool) {
      return function(word) {
        var token = word.toLowerCase();
        if (keepMap.hasOwnProperty(token))
          return true;
        if (replaceMap.hasOwnProperty(token))
          return false;
        return sanitizeWord(token, token, rules) === token;
      };
    }
    function pluralize2(word, count, inclusive) {
      var pluralized = count === 1 ? pluralize2.singular(word) : pluralize2.plural(word);
      return (inclusive ? count + " " : "") + pluralized;
    }
    pluralize2.plural = replaceWord(irregularSingles, irregularPlurals, pluralRules);
    pluralize2.isPlural = checkWord(irregularSingles, irregularPlurals, pluralRules);
    pluralize2.singular = replaceWord(irregularPlurals, irregularSingles, singularRules);
    pluralize2.isSingular = checkWord(irregularPlurals, irregularSingles, singularRules);
    pluralize2.addPluralRule = function(rule, replacement) {
      pluralRules.push([sanitizeRule(rule), replacement]);
    };
    pluralize2.addSingularRule = function(rule, replacement) {
      singularRules.push([sanitizeRule(rule), replacement]);
    };
    pluralize2.addUncountableRule = function(word) {
      if (typeof word === "string") {
        uncountables[word.toLowerCase()] = true;
        return;
      }
      pluralize2.addPluralRule(word, "$0");
      pluralize2.addSingularRule(word, "$0");
    };
    pluralize2.addIrregularRule = function(single, plural) {
      plural = plural.toLowerCase();
      single = single.toLowerCase();
      irregularSingles[single] = plural;
      irregularPlurals[plural] = single;
    };
    [
      ["I", "we"],
      ["me", "us"],
      ["he", "they"],
      ["she", "they"],
      ["them", "them"],
      ["myself", "ourselves"],
      ["yourself", "yourselves"],
      ["itself", "themselves"],
      ["herself", "themselves"],
      ["himself", "themselves"],
      ["themself", "themselves"],
      ["is", "are"],
      ["was", "were"],
      ["has", "have"],
      ["this", "these"],
      ["that", "those"],
      ["echo", "echoes"],
      ["dingo", "dingoes"],
      ["volcano", "volcanoes"],
      ["tornado", "tornadoes"],
      ["torpedo", "torpedoes"],
      ["genus", "genera"],
      ["viscus", "viscera"],
      ["stigma", "stigmata"],
      ["stoma", "stomata"],
      ["dogma", "dogmata"],
      ["lemma", "lemmata"],
      ["schema", "schemata"],
      ["anathema", "anathemata"],
      ["ox", "oxen"],
      ["axe", "axes"],
      ["die", "dice"],
      ["yes", "yeses"],
      ["foot", "feet"],
      ["eave", "eaves"],
      ["goose", "geese"],
      ["tooth", "teeth"],
      ["quiz", "quizzes"],
      ["human", "humans"],
      ["proof", "proofs"],
      ["carve", "carves"],
      ["valve", "valves"],
      ["looey", "looies"],
      ["thief", "thieves"],
      ["groove", "grooves"],
      ["pickaxe", "pickaxes"],
      ["passerby", "passersby"]
    ].forEach(function(rule) {
      return pluralize2.addIrregularRule(rule[0], rule[1]);
    });
    [
      [/s?$/i, "s"],
      [/[^\u0000-\u007F]$/i, "$0"],
      [/([^aeiou]ese)$/i, "$1"],
      [/(ax|test)is$/i, "$1es"],
      [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, "$1es"],
      [/(e[mn]u)s?$/i, "$1s"],
      [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, "$1"],
      [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, "$1i"],
      [/(alumn|alg|vertebr)(?:a|ae)$/i, "$1ae"],
      [/(seraph|cherub)(?:im)?$/i, "$1im"],
      [/(her|at|gr)o$/i, "$1oes"],
      [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, "$1a"],
      [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, "$1a"],
      [/sis$/i, "ses"],
      [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, "$1$2ves"],
      [/([^aeiouy]|qu)y$/i, "$1ies"],
      [/([^ch][ieo][ln])ey$/i, "$1ies"],
      [/(x|ch|ss|sh|zz)$/i, "$1es"],
      [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, "$1ices"],
      [/\b((?:tit)?m|l)(?:ice|ouse)$/i, "$1ice"],
      [/(pe)(?:rson|ople)$/i, "$1ople"],
      [/(child)(?:ren)?$/i, "$1ren"],
      [/eaux$/i, "$0"],
      [/m[ae]n$/i, "men"],
      ["thou", "you"]
    ].forEach(function(rule) {
      return pluralize2.addPluralRule(rule[0], rule[1]);
    });
    [
      [/s$/i, ""],
      [/(ss)$/i, "$1"],
      [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, "$1fe"],
      [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, "$1f"],
      [/ies$/i, "y"],
      [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, "$1ie"],
      [/\b(mon|smil)ies$/i, "$1ey"],
      [/\b((?:tit)?m|l)ice$/i, "$1ouse"],
      [/(seraph|cherub)im$/i, "$1"],
      [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, "$1"],
      [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, "$1sis"],
      [/(movie|twelve|abuse|e[mn]u)s$/i, "$1"],
      [/(test)(?:is|es)$/i, "$1is"],
      [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, "$1us"],
      [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, "$1um"],
      [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, "$1on"],
      [/(alumn|alg|vertebr)ae$/i, "$1a"],
      [/(cod|mur|sil|vert|ind)ices$/i, "$1ex"],
      [/(matr|append)ices$/i, "$1ix"],
      [/(pe)(rson|ople)$/i, "$1rson"],
      [/(child)ren$/i, "$1"],
      [/(eau)x?$/i, "$1"],
      [/men$/i, "man"]
    ].forEach(function(rule) {
      return pluralize2.addSingularRule(rule[0], rule[1]);
    });
    [
      "adulthood",
      "advice",
      "agenda",
      "aid",
      "aircraft",
      "alcohol",
      "ammo",
      "analytics",
      "anime",
      "athletics",
      "audio",
      "bison",
      "blood",
      "bream",
      "buffalo",
      "butter",
      "carp",
      "cash",
      "chassis",
      "chess",
      "clothing",
      "cod",
      "commerce",
      "cooperation",
      "corps",
      "debris",
      "diabetes",
      "digestion",
      "elk",
      "energy",
      "equipment",
      "excretion",
      "expertise",
      "firmware",
      "flounder",
      "fun",
      "gallows",
      "garbage",
      "graffiti",
      "hardware",
      "headquarters",
      "health",
      "herpes",
      "highjinks",
      "homework",
      "housework",
      "information",
      "jeans",
      "justice",
      "kudos",
      "labour",
      "literature",
      "machinery",
      "mackerel",
      "mail",
      "media",
      "mews",
      "moose",
      "music",
      "mud",
      "manga",
      "news",
      "only",
      "personnel",
      "pike",
      "plankton",
      "pliers",
      "police",
      "pollution",
      "premises",
      "rain",
      "research",
      "rice",
      "salmon",
      "scissors",
      "series",
      "sewage",
      "shambles",
      "shrimp",
      "software",
      "species",
      "staff",
      "swine",
      "tennis",
      "traffic",
      "transportation",
      "trout",
      "tuna",
      "wealth",
      "welfare",
      "whiting",
      "wildebeest",
      "wildlife",
      "you",
      /pok[eé]mon$/i,
      /[^aeiou]ese$/i,
      /deer$/i,
      /fish$/i,
      /measles$/i,
      /o[iu]s$/i,
      /pox$/i,
      /sheep$/i
    ].forEach(pluralize2.addUncountableRule);
    return pluralize2;
  });
});

// node_modules/typed-conversions/dist/esnext/index.js
const lodash = __toModule(require_lodash());
function removeIdPropertyFromHash(hash, idProp = "id") {
  const output = {};
  Object.keys(hash).map((objId) => {
    const input = hash[objId];
    output[objId] = {};
    Object.keys(input).map((prop) => {
      if (prop !== idProp) {
        output[objId][prop] = input[prop];
      }
    });
  });
  return output;
}
function hashToArray(hashObj, __key__ = "id") {
  if (hashObj && typeof hashObj !== "object") {
    throw new Error("Cant convert hash-to-array because hash was not passed in: " + hashObj);
  }
  const hash = Object.assign({}, hashObj);
  const results = [];
  const isHashArray = Object.keys(hash).every((i) => hash[i] === true);
  const isHashValue = Object.keys(hash).every((i) => typeof hash[i] !== "object");
  Object.keys(hash).map((id) => {
    const obj = typeof hash[id] === "object" ? Object.assign(Object.assign({}, hash[id]), {[__key__]: id}) : isHashArray ? id : {[__key__]: id, value: hash[id]};
    results.push(obj);
  });
  return results;
}
function arrayToHash(arr, keyProperty, removeIdProperty = false) {
  if (arr.length === 0) {
    return {};
  }
  const isScalar = typeof arr[0] === "object" ? false : true;
  if (isScalar && keyProperty) {
    const e = new Error(`You can not have an array of primitive values AND set a keyProperty!`);
    e.name = "NotAllowed";
    throw e;
  }
  if (!keyProperty && !isScalar) {
    if (arr[0].hasOwnProperty("id")) {
      keyProperty = "id";
    } else {
      const e = new Error(`Tried to default to a keyProperty of "id" but that property does not appear to be in the array passed in`);
      e.name = "NotAllowed";
      throw e;
    }
  }
  if (!Array.isArray(arr)) {
    const e = new Error(`arrayToHash: input was not an array!`);
    e.name = "NotAllowed";
    throw e;
  }
  const output = arr.reduce((prev, curr) => {
    const key2 = isScalar ? curr : typeof keyProperty === "function" ? keyProperty(curr) : curr[keyProperty];
    return isScalar ? Object.assign(Object.assign({}, prev), {[key2]: true}) : Object.assign(Object.assign({}, prev), {[key2]: curr});
  }, {});
  return removeIdProperty ? removeIdPropertyFromHash(output) : output;
}

// src/decorators/model-meta/property-store.ts
function isProperty(modelKlass) {
  return (prop) => {
    return getModelProperty(modelKlass)(prop) ? true : false;
  };
}
const propertiesByModel = {};
function getModelProperty(model3) {
  const className = model3.constructor.name;
  const propsForModel = getProperties(model3);
  return (prop) => {
    return propsForModel.find((value) => {
      return value.property === prop;
    });
  };
}
function getProperties(model3) {
  const modelName = model3.constructor.name;
  const properties = hashToArray(propertiesByModel[modelName], "property") || [];
  let parent = Object.getPrototypeOf(model3.constructor);
  while (parent.name) {
    const subClass = new parent();
    const subClassName = subClass.constructor.name;
    properties.push(...hashToArray(propertiesByModel[subClassName], "property"));
    parent = Object.getPrototypeOf(subClass.constructor);
  }
  return properties;
}

// src/util.ts
const fast_deep_equal = __toModule(require_fast_deep_equal());
function firstKey(thingy) {
  return Object.keys(thingy)[0];
}
function compareHashes(from, to, modelProps) {
  const results = {
    added: [],
    changed: [],
    removed: []
  };
  from = from ? from : {};
  to = to ? to : {};
  let keys2 = Array.from(new Set([
    ...Object.keys(from),
    ...Object.keys(to)
  ])).filter((i) => i !== "META").filter((i) => i.slice(0, 1) !== "_");
  if (modelProps) {
    keys2 = keys2.filter((i) => modelProps.includes(i));
  }
  keys2.forEach((i) => {
    if (!to[i]) {
      results.added.push(i);
    } else if (from[i] === null) {
      results.removed.push(i);
    } else if (!fast_deep_equal.default(from[i], to[i])) {
      results.changed.push(i);
    }
  });
  return results;
}
function getAllPropertiesFromClassStructure(model3) {
  const modelName = model3.constructor.name;
  const properties = hashToArray(propertiesByModel[modelName], "property") || [];
  let parent = Object.getPrototypeOf(model3.constructor);
  while (parent.name) {
    const subClass = new parent();
    const subClassName = subClass.constructor.name;
    properties.push(...hashToArray(propertiesByModel[subClassName], "property"));
    parent = Object.getPrototypeOf(subClass.constructor);
  }
  return properties.map((p) => p.property);
}
function withoutMetaOrPrivate(model3) {
  if (model3 && model3.META) {
    model3 = {...model3};
    delete model3.META;
  }
  if (model3) {
    Object.keys((key2) => {
      if (key2.slice(0, 1) === "_") {
        delete model3[key2];
      }
    });
  }
  return model3;
}
function capitalize(str) {
  return str ? str.slice(0, 1).toUpperCase() + str.slice(1) : "";
}
function lowercase(str) {
  return str ? str.slice(0, 1).toLowerCase() + str.slice(1) : "";
}

// src/decorators/reflector.ts
const get_value2 = __toModule(require_get_value());
const set_value2 = __toModule(require_set_value());
const propertyReflector = (context = {}, modelRollup) => (modelKlass, key2) => {
  const modelName = modelKlass.constructor.name;
  const reflect = Reflect.getMetadata("design:type", modelKlass, key2) || {};
  const meta2 = {
    ...Reflect.getMetadata(key2, modelKlass) || {},
    type: lowercase(reflect.name),
    ...context,
    property: key2
  };
  Reflect.defineMetadata(key2, meta2, modelKlass);
  if (modelRollup) {
    const modelAndProp = modelName + "." + key2;
    set_value2.default(modelRollup, modelAndProp, {
      ...get_value2.default(modelRollup, modelAndProp),
      ...meta2
    });
  }
};

// src/decorators/model-meta/relationship-store.ts
const relationshipsByModel = {};
function isRelationship(modelKlass) {
  return (prop) => {
    return getModelRelationship(modelKlass)(prop) ? true : false;
  };
}
function getModelRelationship(model3) {
  const relnsForModel = getRelationships(model3);
  const className = model3.constructor.name;
  return (prop) => {
    return relnsForModel.find((value) => {
      return value.property === prop;
    });
  };
}
function getRelationships(model3) {
  const modelName = model3.constructor.name;
  const properties = hashToArray(relationshipsByModel[modelName], "property") || [];
  let parent = Object.getPrototypeOf(model3.constructor);
  while (parent.name) {
    const subClass = new parent();
    const subClassName = subClass.constructor.name;
    properties.push(...hashToArray(relationshipsByModel[subClassName], "property"));
    parent = Object.getPrototypeOf(subClass.constructor);
  }
  return properties;
}

// src/errors/FireModelError.ts
class FireModelError2 extends Error {
  constructor(message, classification = "firemodel/error") {
    super(message);
    this.firemodel = true;
    const parts = classification.split("/");
    const [type, subType] = parts.length === 1 ? ["firemodel", parts[0]] : parts;
    this.name = `${type}/${subType}`;
    this.code = subType;
  }
}

// src/errors/decorators/DecoratorProblem.ts
class DecoratorProblem2 extends FireModelError2 {
  constructor(decorator2, e, context) {
    super("", "firemodel/decorator-problem");
    const errText = typeof e === "string" ? e : e.message;
    this.message = `There was a problem in the "${decorator2}" decorator. ${errText}
${context}`;
  }
}

// src/record/relationships/modelRegistration.ts
const registeredModels = {};
function modelRegister(...models2) {
  models2.forEach((model3) => {
    if (!model3) {
      throw new FireModelError2(`An attempt was made to register a Model subclass but the passed in constructor was undefined!${models2.length > 0 ? ` [ ${models2.length} models being registed during this call ]` : ""}`, "firemodel/not-allowed");
    }
    if (typeof model3 !== "function" || !model3.constructor) {
      throw new FireModelError2(`An attempt was made to register a Model subclass but the passed in constructor was the wrong type [ ${typeof model3} ]!
model passed was: ${model3}`, "firemodel/not-allowed");
    }
    const modelName = new model3().constructor.name;
    registeredModels[modelName] = model3;
  });
}
function listRegisteredModels() {
  return Object.keys(registeredModels);
}
function modelRegistryLookup(name) {
  const model3 = registeredModels[name];
  if (!name) {
    throw new FireModelError2(`Look failed because the model ${name} was not registered!`, "firemodel/not-allowed");
  }
  return model3;
}
const modelNameLookup = (name) => () => {
  return modelRegistryLookup(name);
};
const modelConstructorLookup = (constructor) => () => {
  return isConstructable(constructor) ? constructor : constructor();
};
function isConstructable(fn) {
  try {
    const f = new fn();
    return true;
  } catch (e) {
    return false;
  }
}

// src/decorators/hasMany.ts
function hasMany(fkClass, inverse) {
  try {
    const fkConstructor = typeof fkClass === "string" ? modelNameLookup(fkClass) : modelConstructorLookup(fkClass);
    let inverseProperty;
    let directionality;
    if (Array.isArray(inverse)) {
      [inverseProperty, directionality] = inverse;
    } else {
      inverseProperty = inverse;
      directionality = inverse ? "bi-directional" : "one-way";
    }
    const payload = {
      isRelationship: true,
      isProperty: false,
      relType: "hasMany",
      directionality,
      fkConstructor
    };
    if (inverseProperty) {
      payload.inverseProperty = inverseProperty;
    }
    return propertyReflector({...payload, type: "Object"}, relationshipsByModel);
  } catch (e) {
    throw new DecoratorProblem2("hasMany", e, {inverse});
  }
}

// src/decorators/hasOne.ts
function belongsTo(fkClass, inverse) {
  try {
    const fkConstructor = typeof fkClass === "string" ? modelNameLookup(fkClass) : modelConstructorLookup(fkClass);
    let inverseProperty;
    let directionality;
    if (Array.isArray(inverse)) {
      [inverseProperty, directionality] = inverse;
    } else {
      inverseProperty = inverse;
      directionality = inverse ? "bi-directional" : "one-way";
    }
    const payload = {
      isRelationship: true,
      isProperty: false,
      relType: "hasOne",
      directionality,
      fkConstructor
    };
    if (inverseProperty) {
      payload.inverseProperty = inverseProperty;
    }
    return propertyReflector({...payload, type: "String"}, relationshipsByModel);
  } catch (e) {
    throw new DecoratorProblem2("hasOne", e, {inverse});
  }
}
const ownedBy = belongsTo;
const hasOne = belongsTo;

// node_modules/reflect-metadata/Reflect.js
var Reflect2;
(function(Reflect3) {
  (function(factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : Function("return this;")();
    var exporter = makeExporter(Reflect3);
    if (typeof root.Reflect === "undefined") {
      root.Reflect = Reflect3;
    } else {
      exporter = makeExporter(root.Reflect, exporter);
    }
    factory(exporter);
    function makeExporter(target, previous) {
      return function(key2, value) {
        if (typeof target[key2] !== "function") {
          Object.defineProperty(target, key2, {configurable: true, writable: true, value});
        }
        if (previous)
          previous(key2, value);
      };
    }
  })(function(exporter) {
    var hasOwn2 = Object.prototype.hasOwnProperty;
    var supportsSymbol = typeof Symbol === "function";
    var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
    var iteratorSymbol2 = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
    var supportsCreate = typeof Object.create === "function";
    var supportsProto = {__proto__: []} instanceof Array;
    var downLevel = !supportsCreate && !supportsProto;
    var HashMap = {
      create: supportsCreate ? function() {
        return MakeDictionary(Object.create(null));
      } : supportsProto ? function() {
        return MakeDictionary({__proto__: null});
      } : function() {
        return MakeDictionary({});
      },
      has: downLevel ? function(map, key2) {
        return hasOwn2.call(map, key2);
      } : function(map, key2) {
        return key2 in map;
      },
      get: downLevel ? function(map, key2) {
        return hasOwn2.call(map, key2) ? map[key2] : void 0;
      } : function(map, key2) {
        return map[key2];
      }
    };
    var functionPrototype = Object.getPrototypeOf(Function);
    var usePolyfill = typeof process === "object" && process.env && process.env["REFLECT_METADATA_USE_MAP_POLYFILL"] === "true";
    var _Map = !usePolyfill && typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
    var _Set = !usePolyfill && typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
    var _WeakMap = !usePolyfill && typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
    var Metadata = new _WeakMap();
    function decorate(decorators4, target, propertyKey, attributes) {
      if (!IsUndefined(propertyKey)) {
        if (!IsArray(decorators4))
          throw new TypeError();
        if (!IsObject(target))
          throw new TypeError();
        if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
          throw new TypeError();
        if (IsNull(attributes))
          attributes = void 0;
        propertyKey = ToPropertyKey(propertyKey);
        return DecorateProperty(decorators4, target, propertyKey, attributes);
      } else {
        if (!IsArray(decorators4))
          throw new TypeError();
        if (!IsConstructor(target))
          throw new TypeError();
        return DecorateConstructor(decorators4, target);
      }
    }
    exporter("decorate", decorate);
    function metadata(metadataKey, metadataValue) {
      function decorator2(target, propertyKey) {
        if (!IsObject(target))
          throw new TypeError();
        if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
          throw new TypeError();
        OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
      }
      return decorator2;
    }
    exporter("metadata", metadata);
    function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
    }
    exporter("defineMetadata", defineMetadata);
    function hasMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryHasMetadata(metadataKey, target, propertyKey);
    }
    exporter("hasMetadata", hasMetadata);
    function hasOwnMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
    }
    exporter("hasOwnMetadata", hasOwnMetadata);
    function getMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryGetMetadata(metadataKey, target, propertyKey);
    }
    exporter("getMetadata", getMetadata);
    function getOwnMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
    }
    exporter("getOwnMetadata", getOwnMetadata);
    function getMetadataKeys(target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryMetadataKeys(target, propertyKey);
    }
    exporter("getMetadataKeys", getMetadataKeys);
    function getOwnMetadataKeys(target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      return OrdinaryOwnMetadataKeys(target, propertyKey);
    }
    exporter("getOwnMetadataKeys", getOwnMetadataKeys);
    function deleteMetadata(metadataKey, target, propertyKey) {
      if (!IsObject(target))
        throw new TypeError();
      if (!IsUndefined(propertyKey))
        propertyKey = ToPropertyKey(propertyKey);
      var metadataMap = GetOrCreateMetadataMap(target, propertyKey, false);
      if (IsUndefined(metadataMap))
        return false;
      if (!metadataMap.delete(metadataKey))
        return false;
      if (metadataMap.size > 0)
        return true;
      var targetMetadata = Metadata.get(target);
      targetMetadata.delete(propertyKey);
      if (targetMetadata.size > 0)
        return true;
      Metadata.delete(target);
      return true;
    }
    exporter("deleteMetadata", deleteMetadata);
    function DecorateConstructor(decorators4, target) {
      for (var i = decorators4.length - 1; i >= 0; --i) {
        var decorator2 = decorators4[i];
        var decorated = decorator2(target);
        if (!IsUndefined(decorated) && !IsNull(decorated)) {
          if (!IsConstructor(decorated))
            throw new TypeError();
          target = decorated;
        }
      }
      return target;
    }
    function DecorateProperty(decorators4, target, propertyKey, descriptor) {
      for (var i = decorators4.length - 1; i >= 0; --i) {
        var decorator2 = decorators4[i];
        var decorated = decorator2(target, propertyKey, descriptor);
        if (!IsUndefined(decorated) && !IsNull(decorated)) {
          if (!IsObject(decorated))
            throw new TypeError();
          descriptor = decorated;
        }
      }
      return descriptor;
    }
    function GetOrCreateMetadataMap(O, P, Create) {
      var targetMetadata = Metadata.get(O);
      if (IsUndefined(targetMetadata)) {
        if (!Create)
          return void 0;
        targetMetadata = new _Map();
        Metadata.set(O, targetMetadata);
      }
      var metadataMap = targetMetadata.get(P);
      if (IsUndefined(metadataMap)) {
        if (!Create)
          return void 0;
        metadataMap = new _Map();
        targetMetadata.set(P, metadataMap);
      }
      return metadataMap;
    }
    function OrdinaryHasMetadata(MetadataKey, O, P) {
      var hasOwn3 = OrdinaryHasOwnMetadata(MetadataKey, O, P);
      if (hasOwn3)
        return true;
      var parent = OrdinaryGetPrototypeOf(O);
      if (!IsNull(parent))
        return OrdinaryHasMetadata(MetadataKey, parent, P);
      return false;
    }
    function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
      var metadataMap = GetOrCreateMetadataMap(O, P, false);
      if (IsUndefined(metadataMap))
        return false;
      return ToBoolean(metadataMap.has(MetadataKey));
    }
    function OrdinaryGetMetadata(MetadataKey, O, P) {
      var hasOwn3 = OrdinaryHasOwnMetadata(MetadataKey, O, P);
      if (hasOwn3)
        return OrdinaryGetOwnMetadata(MetadataKey, O, P);
      var parent = OrdinaryGetPrototypeOf(O);
      if (!IsNull(parent))
        return OrdinaryGetMetadata(MetadataKey, parent, P);
      return void 0;
    }
    function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
      var metadataMap = GetOrCreateMetadataMap(O, P, false);
      if (IsUndefined(metadataMap))
        return void 0;
      return metadataMap.get(MetadataKey);
    }
    function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
      var metadataMap = GetOrCreateMetadataMap(O, P, true);
      metadataMap.set(MetadataKey, MetadataValue);
    }
    function OrdinaryMetadataKeys(O, P) {
      var ownKeys = OrdinaryOwnMetadataKeys(O, P);
      var parent = OrdinaryGetPrototypeOf(O);
      if (parent === null)
        return ownKeys;
      var parentKeys = OrdinaryMetadataKeys(parent, P);
      if (parentKeys.length <= 0)
        return ownKeys;
      if (ownKeys.length <= 0)
        return parentKeys;
      var set5 = new _Set();
      var keys2 = [];
      for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
        var key2 = ownKeys_1[_i];
        var hasKey = set5.has(key2);
        if (!hasKey) {
          set5.add(key2);
          keys2.push(key2);
        }
      }
      for (var _a2 = 0, parentKeys_1 = parentKeys; _a2 < parentKeys_1.length; _a2++) {
        var key2 = parentKeys_1[_a2];
        var hasKey = set5.has(key2);
        if (!hasKey) {
          set5.add(key2);
          keys2.push(key2);
        }
      }
      return keys2;
    }
    function OrdinaryOwnMetadataKeys(O, P) {
      var keys2 = [];
      var metadataMap = GetOrCreateMetadataMap(O, P, false);
      if (IsUndefined(metadataMap))
        return keys2;
      var keysObj = metadataMap.keys();
      var iterator = GetIterator(keysObj);
      var k = 0;
      while (true) {
        var next = IteratorStep(iterator);
        if (!next) {
          keys2.length = k;
          return keys2;
        }
        var nextValue = IteratorValue(next);
        try {
          keys2[k] = nextValue;
        } catch (e) {
          try {
            IteratorClose(iterator);
          } finally {
            throw e;
          }
        }
        k++;
      }
    }
    function Type(x) {
      if (x === null)
        return 1;
      switch (typeof x) {
        case "undefined":
          return 0;
        case "boolean":
          return 2;
        case "string":
          return 3;
        case "symbol":
          return 4;
        case "number":
          return 5;
        case "object":
          return x === null ? 1 : 6;
        default:
          return 6;
      }
    }
    function IsUndefined(x) {
      return x === void 0;
    }
    function IsNull(x) {
      return x === null;
    }
    function IsSymbol(x) {
      return typeof x === "symbol";
    }
    function IsObject(x) {
      return typeof x === "object" ? x !== null : typeof x === "function";
    }
    function ToPrimitive(input, PreferredType) {
      switch (Type(input)) {
        case 0:
          return input;
        case 1:
          return input;
        case 2:
          return input;
        case 3:
          return input;
        case 4:
          return input;
        case 5:
          return input;
      }
      var hint = PreferredType === 3 ? "string" : PreferredType === 5 ? "number" : "default";
      var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
      if (exoticToPrim !== void 0) {
        var result = exoticToPrim.call(input, hint);
        if (IsObject(result))
          throw new TypeError();
        return result;
      }
      return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
    }
    function OrdinaryToPrimitive(O, hint) {
      if (hint === "string") {
        var toString_1 = O.toString;
        if (IsCallable(toString_1)) {
          var result = toString_1.call(O);
          if (!IsObject(result))
            return result;
        }
        var valueOf = O.valueOf;
        if (IsCallable(valueOf)) {
          var result = valueOf.call(O);
          if (!IsObject(result))
            return result;
        }
      } else {
        var valueOf = O.valueOf;
        if (IsCallable(valueOf)) {
          var result = valueOf.call(O);
          if (!IsObject(result))
            return result;
        }
        var toString_2 = O.toString;
        if (IsCallable(toString_2)) {
          var result = toString_2.call(O);
          if (!IsObject(result))
            return result;
        }
      }
      throw new TypeError();
    }
    function ToBoolean(argument) {
      return !!argument;
    }
    function ToString(argument) {
      return "" + argument;
    }
    function ToPropertyKey(argument) {
      var key2 = ToPrimitive(argument, 3);
      if (IsSymbol(key2))
        return key2;
      return ToString(key2);
    }
    function IsArray(argument) {
      return Array.isArray ? Array.isArray(argument) : argument instanceof Object ? argument instanceof Array : Object.prototype.toString.call(argument) === "[object Array]";
    }
    function IsCallable(argument) {
      return typeof argument === "function";
    }
    function IsConstructor(argument) {
      return typeof argument === "function";
    }
    function IsPropertyKey(argument) {
      switch (Type(argument)) {
        case 3:
          return true;
        case 4:
          return true;
        default:
          return false;
      }
    }
    function GetMethod(V, P) {
      var func = V[P];
      if (func === void 0 || func === null)
        return void 0;
      if (!IsCallable(func))
        throw new TypeError();
      return func;
    }
    function GetIterator(obj) {
      var method = GetMethod(obj, iteratorSymbol2);
      if (!IsCallable(method))
        throw new TypeError();
      var iterator = method.call(obj);
      if (!IsObject(iterator))
        throw new TypeError();
      return iterator;
    }
    function IteratorValue(iterResult) {
      return iterResult.value;
    }
    function IteratorStep(iterator) {
      var result = iterator.next();
      return result.done ? false : result;
    }
    function IteratorClose(iterator) {
      var f = iterator["return"];
      if (f)
        f.call(iterator);
    }
    function OrdinaryGetPrototypeOf(O) {
      var proto = Object.getPrototypeOf(O);
      if (typeof O !== "function" || O === functionPrototype)
        return proto;
      if (proto !== functionPrototype)
        return proto;
      var prototype = O.prototype;
      var prototypeProto = prototype && Object.getPrototypeOf(prototype);
      if (prototypeProto == null || prototypeProto === Object.prototype)
        return proto;
      var constructor = prototypeProto.constructor;
      if (typeof constructor !== "function")
        return proto;
      if (constructor === O)
        return proto;
      return constructor;
    }
    function CreateMapPolyfill() {
      var cacheSentinel = {};
      var arraySentinel = [];
      var MapIterator = function() {
        function MapIterator2(keys2, values, selector) {
          this._index = 0;
          this._keys = keys2;
          this._values = values;
          this._selector = selector;
        }
        MapIterator2.prototype["@@iterator"] = function() {
          return this;
        };
        MapIterator2.prototype[iteratorSymbol2] = function() {
          return this;
        };
        MapIterator2.prototype.next = function() {
          var index10 = this._index;
          if (index10 >= 0 && index10 < this._keys.length) {
            var result = this._selector(this._keys[index10], this._values[index10]);
            if (index10 + 1 >= this._keys.length) {
              this._index = -1;
              this._keys = arraySentinel;
              this._values = arraySentinel;
            } else {
              this._index++;
            }
            return {value: result, done: false};
          }
          return {value: void 0, done: true};
        };
        MapIterator2.prototype.throw = function(error) {
          if (this._index >= 0) {
            this._index = -1;
            this._keys = arraySentinel;
            this._values = arraySentinel;
          }
          throw error;
        };
        MapIterator2.prototype.return = function(value) {
          if (this._index >= 0) {
            this._index = -1;
            this._keys = arraySentinel;
            this._values = arraySentinel;
          }
          return {value, done: true};
        };
        return MapIterator2;
      }();
      return function() {
        function Map2() {
          this._keys = [];
          this._values = [];
          this._cacheKey = cacheSentinel;
          this._cacheIndex = -2;
        }
        Object.defineProperty(Map2.prototype, "size", {
          get: function() {
            return this._keys.length;
          },
          enumerable: true,
          configurable: true
        });
        Map2.prototype.has = function(key2) {
          return this._find(key2, false) >= 0;
        };
        Map2.prototype.get = function(key2) {
          var index10 = this._find(key2, false);
          return index10 >= 0 ? this._values[index10] : void 0;
        };
        Map2.prototype.set = function(key2, value) {
          var index10 = this._find(key2, true);
          this._values[index10] = value;
          return this;
        };
        Map2.prototype.delete = function(key2) {
          var index10 = this._find(key2, false);
          if (index10 >= 0) {
            var size = this._keys.length;
            for (var i = index10 + 1; i < size; i++) {
              this._keys[i - 1] = this._keys[i];
              this._values[i - 1] = this._values[i];
            }
            this._keys.length--;
            this._values.length--;
            if (key2 === this._cacheKey) {
              this._cacheKey = cacheSentinel;
              this._cacheIndex = -2;
            }
            return true;
          }
          return false;
        };
        Map2.prototype.clear = function() {
          this._keys.length = 0;
          this._values.length = 0;
          this._cacheKey = cacheSentinel;
          this._cacheIndex = -2;
        };
        Map2.prototype.keys = function() {
          return new MapIterator(this._keys, this._values, getKey);
        };
        Map2.prototype.values = function() {
          return new MapIterator(this._keys, this._values, getValue);
        };
        Map2.prototype.entries = function() {
          return new MapIterator(this._keys, this._values, getEntry);
        };
        Map2.prototype["@@iterator"] = function() {
          return this.entries();
        };
        Map2.prototype[iteratorSymbol2] = function() {
          return this.entries();
        };
        Map2.prototype._find = function(key2, insert) {
          if (this._cacheKey !== key2) {
            this._cacheIndex = this._keys.indexOf(this._cacheKey = key2);
          }
          if (this._cacheIndex < 0 && insert) {
            this._cacheIndex = this._keys.length;
            this._keys.push(key2);
            this._values.push(void 0);
          }
          return this._cacheIndex;
        };
        return Map2;
      }();
      function getKey(key2, _23) {
        return key2;
      }
      function getValue(_23, value) {
        return value;
      }
      function getEntry(key2, value) {
        return [key2, value];
      }
    }
    function CreateSetPolyfill() {
      return function() {
        function Set2() {
          this._map = new _Map();
        }
        Object.defineProperty(Set2.prototype, "size", {
          get: function() {
            return this._map.size;
          },
          enumerable: true,
          configurable: true
        });
        Set2.prototype.has = function(value) {
          return this._map.has(value);
        };
        Set2.prototype.add = function(value) {
          return this._map.set(value, value), this;
        };
        Set2.prototype.delete = function(value) {
          return this._map.delete(value);
        };
        Set2.prototype.clear = function() {
          this._map.clear();
        };
        Set2.prototype.keys = function() {
          return this._map.keys();
        };
        Set2.prototype.values = function() {
          return this._map.values();
        };
        Set2.prototype.entries = function() {
          return this._map.entries();
        };
        Set2.prototype["@@iterator"] = function() {
          return this.keys();
        };
        Set2.prototype[iteratorSymbol2] = function() {
          return this.keys();
        };
        return Set2;
      }();
    }
    function CreateWeakMapPolyfill() {
      var UUID_SIZE = 16;
      var keys2 = HashMap.create();
      var rootKey = CreateUniqueKey();
      return function() {
        function WeakMap2() {
          this._key = CreateUniqueKey();
        }
        WeakMap2.prototype.has = function(target) {
          var table = GetOrCreateWeakMapTable(target, false);
          return table !== void 0 ? HashMap.has(table, this._key) : false;
        };
        WeakMap2.prototype.get = function(target) {
          var table = GetOrCreateWeakMapTable(target, false);
          return table !== void 0 ? HashMap.get(table, this._key) : void 0;
        };
        WeakMap2.prototype.set = function(target, value) {
          var table = GetOrCreateWeakMapTable(target, true);
          table[this._key] = value;
          return this;
        };
        WeakMap2.prototype.delete = function(target) {
          var table = GetOrCreateWeakMapTable(target, false);
          return table !== void 0 ? delete table[this._key] : false;
        };
        WeakMap2.prototype.clear = function() {
          this._key = CreateUniqueKey();
        };
        return WeakMap2;
      }();
      function CreateUniqueKey() {
        var key2;
        do
          key2 = "@@WeakMap@@" + CreateUUID();
        while (HashMap.has(keys2, key2));
        keys2[key2] = true;
        return key2;
      }
      function GetOrCreateWeakMapTable(target, create) {
        if (!hasOwn2.call(target, rootKey)) {
          if (!create)
            return void 0;
          Object.defineProperty(target, rootKey, {value: HashMap.create()});
        }
        return target[rootKey];
      }
      function FillRandomBytes(buffer, size) {
        for (var i = 0; i < size; ++i)
          buffer[i] = Math.random() * 255 | 0;
        return buffer;
      }
      function GenRandomBytes(size) {
        if (typeof Uint8Array === "function") {
          if (typeof crypto !== "undefined")
            return crypto.getRandomValues(new Uint8Array(size));
          if (typeof msCrypto !== "undefined")
            return msCrypto.getRandomValues(new Uint8Array(size));
          return FillRandomBytes(new Uint8Array(size), size);
        }
        return FillRandomBytes(new Array(size), size);
      }
      function CreateUUID() {
        var data = GenRandomBytes(UUID_SIZE);
        data[6] = data[6] & 79 | 64;
        data[8] = data[8] & 191 | 128;
        var result = "";
        for (var offset = 0; offset < UUID_SIZE; ++offset) {
          var byte = data[offset];
          if (offset === 4 || offset === 6 || offset === 8)
            result += "-";
          if (byte < 16)
            result += "0";
          result += byte.toString(16).toLowerCase();
        }
        return result;
      }
    }
    function MakeDictionary(obj) {
      obj.__ = void 0;
      delete obj.__;
      return obj;
    }
  });
})(Reflect2 || (Reflect2 = {}));

// src/decorators/indexing.ts
const indexesForModel = {};
function getDbIndexes(modelKlass) {
  const modelName = modelKlass.constructor.name;
  return modelName === "Model" ? hashToArray(indexesForModel[modelName]) : (hashToArray(indexesForModel[modelName]) || []).concat(hashToArray(indexesForModel.Model));
}
const index6 = propertyReflector({
  isIndex: true,
  isUniqueIndex: false
}, indexesForModel);
const uniqueIndex = propertyReflector({
  isIndex: true,
  isUniqueIndex: true
}, indexesForModel);

// src/decorators/constraints.ts
function constrainedProperty(options = {}) {
  return propertyReflector({
    ...options,
    ...{isRelationship: false, isProperty: true}
  }, propertiesByModel);
}
function constrain(prop, value) {
  return propertyReflector({[prop]: value}, propertiesByModel);
}
function desc(value) {
  return propertyReflector({desc: value}, propertiesByModel);
}
function min3(value) {
  return propertyReflector({min: value}, propertiesByModel);
}
function max3(value) {
  return propertyReflector({max: value}, propertiesByModel);
}
function length(value) {
  return propertyReflector({length: value}, propertiesByModel);
}
const property = propertyReflector({
  isRelationship: false,
  isProperty: true
}, propertiesByModel);
const pushKey = propertyReflector({pushKey: true}, propertiesByModel);

// src/decorators/decorator.ts
const get_value = __toModule(require_get_value());
const set_value = __toModule(require_set_value());
function getPushKeys(target) {
  const props2 = getProperties(target);
  return props2.filter((p) => p.pushKey).map((p) => p.property);
}

// src/ModelMeta.ts
const meta = {};
function addModelMeta(modelName, props2) {
  meta[modelName] = props2;
}
function getModelMeta(modelKlass) {
  const localMeta = modelKlass.META;
  const modelMeta = meta[modelKlass.modelName];
  return localMeta && localMeta.properties ? localMeta : modelMeta || {};
}

// src/decorators/model.ts
function model(options = {}) {
  let isDirty = false;
  return function decorateModel(target) {
    function addMetaProperty() {
      const modelOfObject = new target();
      if (options.audit === void 0) {
        options.audit = false;
      }
      if (!(options.audit === true || options.audit === false || options.audit === "server")) {
        console.log(`You set the audit property to "${options.audit}" which is invalid. Valid properties are true, false, and "server". The audit property will be set to false for now.`);
        options.audit = false;
      }
      const meta2 = {
        ...options,
        ...{isProperty: isProperty(modelOfObject)},
        ...{property: getModelProperty(modelOfObject)},
        ...{properties: getProperties(modelOfObject)},
        ...{isRelationship: isRelationship(modelOfObject)},
        ...{relationship: getModelRelationship(modelOfObject)},
        ...{relationships: getRelationships(modelOfObject)},
        ...{dbIndexes: getDbIndexes(modelOfObject)},
        ...{pushKeys: getPushKeys(modelOfObject)},
        ...{dbOffset: options.dbOffset ? options.dbOffset : ""},
        ...{audit: options.audit ? options.audit : false},
        ...{plural: options.plural},
        ...{
          allProperties: [
            ...getProperties(modelOfObject).map((p) => p.property),
            ...getRelationships(modelOfObject).map((p) => p.property)
          ]
        },
        ...{
          localPostfix: options.localPostfix === void 0 ? "all" : options.localPostfix
        },
        ...{
          localModelName: options.localModelName === void 0 ? modelOfObject.constructor.name.slice(0, 1).toLowerCase() + modelOfObject.constructor.name.slice(1) : options.localModelName
        },
        ...{isDirty}
      };
      addModelMeta(target.constructor.name.toLowerCase(), meta2);
      Object.defineProperty(target.prototype, "META", {
        get() {
          return meta2;
        },
        set(prop) {
          if (typeof prop === "object" && prop.isDirty !== void 0) {
            isDirty = prop.isDirty;
          } else {
            throw new Error("The META properties should only be set with the @model decorator at design time!");
          }
        },
        configurable: false,
        enumerable: false
      });
      if (target) {
        modelRegister(target);
      }
      return target;
    }
    addMetaProperty.prototype = target.prototype;
    return addMetaProperty();
  };
}

// src/decorators/types.ts

// src/decorators/defaultValue.ts
function defaultValue(value) {
  return propertyReflector({defaultValue: value}, propertiesByModel);
}

// src/decorators/OneWay.ts
function OneWay(inverseProperty) {
  return [inverseProperty, "one-way"];
}

// src/decorators/mock.ts
function mock(value, ...rest) {
  return propertyReflector({mockType: value, mockParameters: rest}, propertiesByModel);
}

// src/decorators/encrypt.ts
const encrypt = propertyReflector({encrypt: true}, propertiesByModel);

// src/decorators/index.ts

// src/models/Model.ts
let Model59 = class {
};
__decorate([
  property
], Model59.prototype, "id", 2);
__decorate([
  property,
  mock("dateRecentMiliseconds"),
  index6
], Model59.prototype, "lastUpdated", 2);
__decorate([
  property,
  mock("datePastMiliseconds"),
  index6
], Model59.prototype, "createdAt", 2);
Model59 = __decorate([
  model()
], Model59);

// src/models/AuditLog.ts
let AuditLog = class extends Model59 {
};
__decorate([
  property,
  index6
], AuditLog.prototype, "modelName", 2);
__decorate([
  property,
  index6
], AuditLog.prototype, "modelId", 2);
__decorate([
  property
], AuditLog.prototype, "changes", 2);
__decorate([
  property
], AuditLog.prototype, "action", 2);
AuditLog = __decorate([
  model({dbOffset: "_auditing"})
], AuditLog);

// src/models/index.ts

// node_modules/common-types/dist/es/index.js
async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
var HttpStatusCodes;
(function(HttpStatusCodes2) {
  HttpStatusCodes2[HttpStatusCodes2["Continue"] = 100] = "Continue";
  HttpStatusCodes2[HttpStatusCodes2["Success"] = 200] = "Success";
  HttpStatusCodes2[HttpStatusCodes2["Created"] = 201] = "Created";
  HttpStatusCodes2[HttpStatusCodes2["Accepted"] = 202] = "Accepted";
  HttpStatusCodes2[HttpStatusCodes2["NoContent"] = 204] = "NoContent";
  HttpStatusCodes2[HttpStatusCodes2["MovedPermenantly"] = 301] = "MovedPermenantly";
  HttpStatusCodes2[HttpStatusCodes2["TemporaryRedirect"] = 307] = "TemporaryRedirect";
  HttpStatusCodes2[HttpStatusCodes2["NotModified"] = 304] = "NotModified";
  HttpStatusCodes2[HttpStatusCodes2["BadRequest"] = 400] = "BadRequest";
  HttpStatusCodes2[HttpStatusCodes2["Unauthorized"] = 401] = "Unauthorized";
  HttpStatusCodes2[HttpStatusCodes2["PaymentRequired"] = 402] = "PaymentRequired";
  HttpStatusCodes2[HttpStatusCodes2["Forbidden"] = 403] = "Forbidden";
  HttpStatusCodes2[HttpStatusCodes2["NotFound"] = 404] = "NotFound";
  HttpStatusCodes2[HttpStatusCodes2["MethodNotAllowed"] = 405] = "MethodNotAllowed";
  HttpStatusCodes2[HttpStatusCodes2["RequestTimeout"] = 408] = "RequestTimeout";
  HttpStatusCodes2[HttpStatusCodes2["Conflict"] = 409] = "Conflict";
  HttpStatusCodes2[HttpStatusCodes2["Gone"] = 410] = "Gone";
  HttpStatusCodes2[HttpStatusCodes2["IAmATeapot"] = 418] = "IAmATeapot";
  HttpStatusCodes2[HttpStatusCodes2["UnprocessableEntity"] = 422] = "UnprocessableEntity";
  HttpStatusCodes2[HttpStatusCodes2["TooManyRequests"] = 429] = "TooManyRequests";
  HttpStatusCodes2[HttpStatusCodes2["InternalServerError"] = 500] = "InternalServerError";
  HttpStatusCodes2[HttpStatusCodes2["NotImplemented"] = 501] = "NotImplemented";
  HttpStatusCodes2[HttpStatusCodes2["BadGateway"] = 502] = "BadGateway";
  HttpStatusCodes2[HttpStatusCodes2["ServiceUnavailable"] = 503] = "ServiceUnavailable";
  HttpStatusCodes2[HttpStatusCodes2["GatewayTimeout"] = 504] = "GatewayTimeout";
  HttpStatusCodes2[HttpStatusCodes2["AuthenticationRequired"] = 511] = "AuthenticationRequired";
})(HttpStatusCodes || (HttpStatusCodes = {}));
class ParseStackError extends Error {
  constructor(code, message, originalString, structuredString) {
    super();
    this.originalString = originalString;
    this.structuredString = structuredString;
    this.message = `[parseStack/${code}] ` + message;
    this.code = code;
    this.name = `parseStack/${code}`;
  }
}
class PathJoinError extends Error {
  constructor(code, message) {
    super();
    this.message = `[pathJoin/${code}] ` + message;
    this.code = code;
    this.name = `pathJoin/${code}`;
  }
}
var moreThanThreePeriods = /\.{3,}/g;
if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === "[object Array]";
  };
}
function pathJoin(...args) {
  if (!args.every((i) => !["undefined"].includes(typeof i))) {
    args = args.filter((a) => a);
  }
  if (!args.every((i) => ["string", "number"].includes(typeof i))) {
    throw new PathJoinError("invalid-path-part", `Attempt to use pathJoin() failed because some of the path parts were of the wrong type. Path parts must be either a string or an number: ${args.map((i) => typeof i)}`);
  }
  try {
    const reducer = function(agg, pathPart) {
      let {protocol, parts} = pullOutProtocols(agg);
      parts.push(typeof pathPart === "number" ? String(pathPart) : stripSlashesAtExtremities(pathPart));
      return protocol + parts.filter((i) => i).join("/");
    };
    const result = removeSingleDotExceptToStart(doubleDotOnlyToStart(args.reduce(reducer, "").replace(moreThanThreePeriods, "..")));
    return result;
  } catch (e) {
    if (e.name.includes("pathJoin")) {
      throw e;
    } else {
      throw new PathJoinError(e.name || "unknown", e.message);
    }
  }
}
function pullOutProtocols(content) {
  const protocols = ["https://", "http://", "file://", "tel://"];
  let protocol = "";
  protocols.forEach((p) => {
    if (content.includes(p)) {
      protocol = p;
      content = content.replace(p, "");
    }
  });
  return {protocol, parts: content.split("/")};
}
function stripSlashesAtExtremities(pathPart) {
  const front = pathPart.slice(0, 1) === "/" ? pathPart.slice(1) : pathPart;
  const back = front.slice(-1) === "/" ? front.slice(0, front.length - 1) : front;
  return back.slice(0, 1) === "/" || back.slice(-1) === "/" ? stripSlashesAtExtremities(back) : back;
}
function doubleDotOnlyToStart(path4) {
  if (path4.slice(2).includes("..")) {
    throw new PathJoinError("not-allowed", `The path "${path4}" is not allowed because it  has ".." in it. This notation is fine at the beginning of a path but no where else.`);
  }
  return path4;
}
function removeSingleDotExceptToStart(path4) {
  let parts = path4.split("/");
  return parts[0] + "/" + parts.slice(1).filter((i) => i !== ".").join("/");
}
function dotNotation(input) {
  return input.replace(/\//g, ".");
}
class ApiGatewayError extends Error {
}
class AppError extends Error {
}

// node_modules/firebase-key/dist/esm5/key-alphabet.js
var alphabet = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";

// node_modules/firebase-key/dist/esm5/text-random-string.js
function randomString(alphabet2, length2) {
  var buffer = [];
  length2 = length2 | 0;
  while (length2) {
    var r = Math.random() * alphabet2.length | 0;
    buffer.push(alphabet2.charAt(r));
    length2 -= 1;
  }
  return buffer.join("");
}

// node_modules/firebase-key/dist/esm5/key-key.js
var lastTimestamp = 0;
function key(timestamp, as) {
  if (timestamp === void 0) {
    timestamp = Date.now();
    if (timestamp <= lastTimestamp) {
      timestamp = lastTimestamp + 1;
    }
    lastTimestamp = timestamp;
  }
  if (timestamp instanceof Date) {
    timestamp = timestamp.getTime();
  }
  var result = new Array(9);
  for (var i = 7; i >= 0; --i) {
    result[i] = alphabet.charAt(timestamp % 64);
    timestamp = Math.floor(timestamp / 64);
  }
  if (timestamp !== 0) {
    throw new Error("Unexpected timestamp.");
  }
  switch (as) {
    case "max":
      result[8] = "zzzzzzzzzzzz";
      break;
    case "min":
      result[8] = "------------";
      break;
    default:
      result[8] = randomString(alphabet, 12);
  }
  return result.join("");
}

// src/FireModel.ts
const pluralize = require_pluralize();
const defaultDispatch = async (context) => "";
class FireModel2 {
  static get defaultDb() {
    return FireModel2._defaultDb;
  }
  static set defaultDb(db) {
    this._defaultDb = db;
  }
  static set dispatch(fn) {
    if (!fn) {
      FireModel2._dispatchActive = false;
      FireModel2._dispatch = defaultDispatch;
    } else {
      FireModel2._dispatchActive = true;
      FireModel2._dispatch = fn;
    }
  }
  static get dispatch() {
    return FireModel2._dispatch;
  }
  get modelName() {
    const name = this._model.constructor.name;
    const pascal = name.slice(0, 1).toLowerCase() + name.slice(1);
    return pascal;
  }
  get pluralName() {
    const explicitPlural = this.META.plural;
    return explicitPlural || pluralize(this.modelName);
  }
  get dbPath() {
    return "dbPath was not overwritten!";
  }
  get localPath() {
    return "dbPath was not overwritten!";
  }
  get META() {
    return getModelMeta(this._model);
  }
  get properties() {
    const meta2 = getModelMeta(this._model);
    return meta2.properties;
  }
  get relationships() {
    const meta2 = getModelMeta(this._model);
    return meta2.relationships;
  }
  get dispatch() {
    return FireModel2.dispatch;
  }
  static get isDefaultDispatch() {
    return FireModel2.dispatch === defaultDispatch;
  }
  get dispatchIsActive() {
    return FireModel2._dispatchActive;
  }
  get db() {
    if (!this._db) {
      this._db = FireModel2.defaultDb;
    }
    if (!this._db) {
      const e = new Error(`Can't get DB as it has not been set yet for this instance and no default database exists [ ${this.modelName} ]!`);
      e.name = "FireModel::NoDatabase";
      throw e;
    }
    return this._db;
  }
  get pushKeys() {
    return this._model.META.pushKeys;
  }
  static async connect(RTDB, options) {
    const db = await RTDB.connect(options);
    FireModel2.defaultDb = db;
    return db;
  }
  static register(model3) {
    modelRegister(model3);
  }
  static listRegisteredModels() {
    return listRegisteredModels();
  }
  static lookupModel(name) {
    return modelRegistryLookup(name);
  }
  static isBeingWatched(path4) {
    return false;
  }
  _getPaths(rec, deltas) {
    const added = (deltas.added || []).reduce((agg, curr) => {
      agg[pathJoin(this.dbPath, curr)] = rec.get(curr);
      return agg;
    }, {});
    const removed = (deltas.removed || []).reduce((agg, curr) => {
      agg[pathJoin(this.dbPath, curr)] = null;
      return agg;
    }, {});
    const updated = (deltas.changed || []).reduce((agg, curr) => {
      agg[pathJoin(this.dbPath, curr)] = rec.get(curr);
      return agg;
    }, {});
    return {...added, ...removed, ...updated};
  }
}
FireModel2.auditLogs = "/auditing";
FireModel2._dispatchActive = false;
FireModel2._dispatch = defaultDispatch;

// src/record/buildDeepRelationshipLinks.ts
async function buildDeepRelationshipLinks2(rec, property2) {
  const meta2 = getModelMeta(rec).property(property2);
  return meta2.relType === "hasMany" ? processHasMany3(rec, property2) : processBelongsTo(rec, property2);
}
async function processHasMany3(rec, property2) {
  const meta2 = getModelMeta(rec).property(property2);
  const fks = rec.get(property2);
  const promises = [];
  for (const key2 of Object.keys(fks)) {
    const fk6 = fks[key2];
    if (fk6 !== true) {
      const fkRecord = await Record2.add(meta2.fkConstructor(), fk6, {
        setDeepRelationships: true
      });
      await rec.addToRelationship(property2, fkRecord.compositeKeyRef);
    }
  }
  const newFks = Object.keys(rec.get(property2)).reduce((foreignKeys, curr) => {
    const fk6 = fks[curr];
    if (fk6 !== true) {
      delete foreignKeys[curr];
    }
    return foreignKeys;
  }, {});
  rec._data[property2] = newFks;
  return;
}
async function processBelongsTo(rec, property2) {
  const fk6 = rec.get(property2);
  const meta2 = getModelMeta(rec).property(property2);
  if (fk6 && typeof fk6 === "object") {
    const fkRecord = Record2.add(meta2.fkConstructor(), fk6, {
      setDeepRelationships: true
    });
  }
}

// src/state-mgmt/actions.ts
var FmEvents;
(function(FmEvents5) {
  FmEvents5["RECORD_ADDED_LOCALLY"] = "@firemodel/RECORD_ADDED_LOCALLY";
  FmEvents5["RECORD_ADDED_CONFIRMATION"] = "@firemodel/RECORD_ADDED_CONFIRMATION";
  FmEvents5["RECORD_ADDED_ROLLBACK"] = "@firemodel/RECORD_ADDED_ROLLBACK";
  FmEvents5["RECORD_ADDED"] = "@firemodel/RECORD_ADDED";
  FmEvents5["RECORD_CHANGED_LOCALLY"] = "@firemodel/RECORD_CHANGED_LOCALLY";
  FmEvents5["RECORD_CHANGED_CONFIRMATION"] = "@firemodel/RECORD_CHANGED_CONFIRMATION";
  FmEvents5["RECORD_CHANGED_ROLLBACK"] = "@firemodel/RECORD_CHANGED_ROLLBACK";
  FmEvents5["RECORD_CHANGED"] = "@firemodel/RECORD_CHANGED";
  FmEvents5["RECORD_MOVED"] = "@firemodel/RECORD_MOVED";
  FmEvents5["RECORD_REMOVED_LOCALLY"] = "@firemodel/RECORD_REMOVED_LOCALLY";
  FmEvents5["RECORD_REMOVED_CONFIRMATION"] = "@firemodel/RECORD_REMOVED_CONFIRMATION";
  FmEvents5["RECORD_REMOVED_ROLLBACK"] = "@firemodel/RECORD_REMOVED_LOCALLY";
  FmEvents5["RECORD_REMOVED"] = "@firemodel/RECORD_REMOVED";
  FmEvents5["PERMISSION_DENIED"] = "@firemodel/PERMISSION_DENIED";
  FmEvents5["RECORD_LOCAL_ROLLBACK"] = "@firemodel/RECORD_LOCAL_ROLLBACK";
  FmEvents5["SINCE_UPDATED"] = "@firemodel/SINCE_UPDATED";
  FmEvents5["WATCHER_STARTING"] = "@firemodel/WATCHER_STARTING";
  FmEvents5["WATCHER_STARTED"] = "@firemodel/WATCHER_STARTED";
  FmEvents5["WATCHER_SYNC"] = "@firemodel/WATCHER_SYNC";
  FmEvents5["WATCHER_FAILED"] = "@firemodel/WATCHER_FAILED";
  FmEvents5["WATCHER_STOPPED"] = "@firemodel/WATCHER_STOPPED";
  FmEvents5["WATCHER_STOPPED_ALL"] = "@firemodel/WATCHER_STOPPED_ALL";
  FmEvents5["RELATIONSHIP_REMOVED_LOCALLY"] = "@firemodel/RELATIONSHIP_REMOVED_LOCALLY";
  FmEvents5["RELATIONSHIP_REMOVED_CONFIRMATION"] = "@firemodel/RELATIONSHIP_REMOVED_CONFIRMATION";
  FmEvents5["RELATIONSHIP_REMOVED_ROLLBACK"] = "@firemodel/RELATIONSHIP_REMOVED_ROLLBACK";
  FmEvents5["RELATIONSHIP_ADDED_LOCALLY"] = "@firemodel/RELATIONSHIP_ADDED_LOCALLY";
  FmEvents5["RELATIONSHIP_ADDED_CONFIRMATION"] = "@firemodel/RELATIONSHIP_ADDED_CONFIRMATION";
  FmEvents5["RELATIONSHIP_ADDED_ROLLBACK"] = "@firemodel/RELATIONSHIP_ADDED_ROLLBACK";
  FmEvents5["RELATIONSHIP_SET_LOCALLY"] = "@firemodel/RELATIONSHIP_SET_LOCALLY";
  FmEvents5["RELATIONSHIP_SET_CONFIRMATION"] = "@firemodel/RELATIONSHIP_SET_CONFIRMATION";
  FmEvents5["RELATIONSHIP_SET_ROLLBACK"] = "@firemodel/RELATIONSHIP_ADDED_ROLLBACK";
  FmEvents5["RELATIONSHIP_DUPLICATE_ADD"] = "@firemodel/RELATIONSHIP_DUPLICATE_ADD";
  FmEvents5["APP_CONNECTED"] = "@firemodel/APP_CONNECTED";
  FmEvents5["APP_DISCONNECTED"] = "@firemodel/APP_DISCONNECTED";
  FmEvents5["UNEXPECTED_ERROR"] = "@firemodel/UNEXPECTED_ERROR";
})(FmEvents || (FmEvents = {}));

// src/state-mgmt/redux.ts

// src/state-mgmt/VuexWrapper.ts
function VeuxWrapper(vuexDispatch) {
  return async (reduxAction) => {
    const type = reduxAction.type;
    delete reduxAction.type;
    return vuexDispatch(type, reduxAction);
  };
}

// src/state-mgmt/events.ts

// src/state-mgmt/IWatcherEventContext.ts

// src/state-mgmt/IFmLocalEvent.ts

// src/state-mgmt/index.ts
var IFmCrudOperations;
(function(IFmCrudOperations3) {
  IFmCrudOperations3["add"] = "add";
  IFmCrudOperations3["update"] = "update";
  IFmCrudOperations3["remove"] = "remove";
})(IFmCrudOperations || (IFmCrudOperations = {}));

// src/path.ts
const moreThanThreePeriods2 = /\.{3,}/g;
if (!Array.isArray) {
  Array.isArray = (arg) => {
    return Object.prototype.toString.call(arg) === "[object Array]";
  };
}
const errorStr = (type) => {
  return `tried to join something other than undefined, a string or an array [${type}], it was ignored in pathJoin's result`;
};
function pathJoin2(...args) {
  return args.reduce((prev, val) => {
    if (typeof prev === "undefined") {
      return;
    }
    if (val === void 0) {
      return prev;
    }
    return typeof val === "string" || typeof val === "number" ? joinStringsWithSlash(prev, "" + val) : Array.isArray(val) ? joinStringsWithSlash(prev, pathJoin2.apply(null, val)) : console.error(errorStr(typeof val));
  }, "").replace(moreThanThreePeriods2, "..");
}
function joinStringsWithSlash(str1, str2) {
  const str1isEmpty = !str1.length;
  const str1EndsInSlash = str1[str1.length - 1] === "/";
  const str2StartsWithSlash = str2[0] === "/";
  const res = str1EndsInSlash && str2StartsWithSlash && str1 + str2.slice(1) || !str1EndsInSlash && !str2StartsWithSlash && !str1isEmpty && str1 + "/" + str2 || str1 + str2;
  return res;
}

// src/Audit.ts
async function writeAudit(record, action, changes, options = {}) {
  const db = options.db || FireModel2.defaultDb;
  await Record2.add(AuditLog, {
    modelName: capitalize(record.modelName),
    modelId: record.id,
    action,
    changes
  }, {db});
}

// src/errors/DexieError.ts
class DexieError2 extends Error {
  constructor(message, classification = "firemodel/dexie") {
    super(message);
    this.firemodel = true;
    const parts = classification.split("/");
    const [type, subType] = parts.length === 1 ? ["firemodel", parts[0]] : parts;
    this.name = `${type}/${subType}`;
    this.code = subType;
  }
}

// src/errors/FireModelProxyError.ts
class FireModelProxyError extends FireModelError2 {
  constructor(e, context = "", name = "") {
    super("", !name ? `firemodel/${e.name}` : name);
    this.firemodel = true;
    this.originalError = e;
    this.message = context ? `${context}.

${e.message}.` : e.message;
    this.stack = e.stack;
  }
}

// src/errors/relationships/FkDoesNotExist.ts
class FkDoesNotExist extends FireModelError2 {
  constructor(pk6, property2, fkId) {
    const fkConstructor = pk6.META.relationship("property").fkConstructor();
    const fkModel = new fkConstructor();
    const message = `Attempt add a FK on of "${pk6.constructor.name}::${fkId}" failed because the model "${fkModel.constructor.name}::${fkId}" doesn't exist!`;
    super(message, "firemodel/fk-does-not-exist");
  }
}

// src/errors/relationships/DuplicateRelationship.ts
class DuplicateRelationship extends FireModelError2 {
  constructor(pk6, property2, fkId) {
    const fkConstructor = pk6.META.relationship("property").fkConstructor();
    const fkModel = new fkConstructor();
    const message = `Attempt add a FK on of "${pk6.constructor.name}::${fkId}" failed because the model "${fkModel.constructor.name}::${fkId}" already had that relationship defined! You can either set the "duplicationIsError" to "false" (the default) or treat this as an error and fix`;
    super(message, "firemodel/duplicate-relationship");
  }
}

// src/errors/relationships/MissingReciprocalInverse.ts
class MissingReciprocalInverse2 extends FireModelError2 {
  constructor(rec, property2) {
    super("", "firemodel/missing-reciprocal-inverse");
    const fkRecord = Record2.create(rec.META.relationship(property2).fkConstructor(), {db: rec.db});
    const pkInverse = rec.META.relationship(property2).inverseProperty;
    const fkInverse = (fkRecord.META.relationship(pkInverse) || {}).inverseProperty || "undefined";
    const message = `The model "${capitalize(rec.modelName)}" is trying to leverage it's relationship with the model "${capitalize(fkRecord.modelName)}" through the property "${property2}" but it appears these two models are in conflict. ${capitalize(rec.modelName)} has been defined to look for an inverse property of "${capitalize(rec.modelName)}.${rec.META.relationship(property2).inverseProperty}" but it is missing [ ${fkInverse} ]! Look at your model definitions and make sure this is addressed.`;
    this.message = message;
  }
}

// src/errors/relationships/IncorrectReciprocalInverse.ts
class IncorrectReciprocalInverse extends FireModelError2 {
  constructor(rec, property2) {
    super("", "firemodel/missing-reciprocal-inverse");
    let message;
    const fkRecord = Record2.create(rec.META.relationship(property2).fkConstructor(), {db: rec.db});
    const inverseProperty = rec.META.relationship(property2).inverseProperty;
    const fkInverse = fkRecord.META.relationship(inverseProperty);
    if (!fkInverse) {
      const e = new MissingReciprocalInverse2(rec, property2);
      throw e;
    } else {
      const recipricalInverse = fkInverse.inverseProperty;
      message = `The model ${rec.modelName} is trying to leverage it's relationship with ${fkRecord.modelName} but it appears these two models are in conflict! ${rec.modelName} has been defined to look for an inverse property of "${inverseProperty}" but on ${fkRecord.modelName} model the inverse property points back to a property of "${recipricalInverse}"! Look at your model definitions and make sure this is addressed.`;
    }
    this.message = message;
  }
}

// src/errors/relationships/NotHasManyRelationship.ts
class NotHasManyRelationship extends FireModelError2 {
  constructor(rec, property2, method) {
    super("", "firemodel/not-hasMany-reln");
    this.message = `attempt to call ${rec.modelName}::${method}() with property "${property2}" failed because ${property2} does not have a hasMany relationship`;
  }
}

// src/errors/relationships/NotHasOneRelationship.ts
class NotHasOneRelationship extends FireModelError2 {
  constructor(rec, property2, method) {
    super("", "firemodel/not-hasOne-reln");
    this.message = `attempt to call ${rec.modelName}::${method}() with property "${property2}" failed because ${property2} does not have a hasOne relationship`;
  }
}

// src/errors/relationships/UnknownRelationshipProblem.ts
class UnknownRelationshipProblem extends FireModelError2 {
  constructor(err, rec, property2, operation = "n/a", whileDoing) {
    const message = `An unexpected error occurred while working with a "${operation}" operation on ${rec.modelName}::${property2}. ${whileDoing ? `This error was encounted while working on ${whileDoing}. ` : ""}The error reported was [${err.name}]: ${err.message}`;
    super(message, "firemodel/unknown-relationship-problem");
    this.stack = err.stack;
  }
}

// src/errors/relationships/MissingInverseProperty.ts
class MissingInverseProperty extends FireModelError2 {
  constructor(rec, property2) {
    super("", "firemodel/missing-inverse-property");
    const fkRecord = Record2.create(rec.META.relationship(property2).fkConstructor(), {db: rec.db});
    this.from = capitalize(rec.modelName);
    this.to = capitalize(fkRecord.modelName);
    const pkInverse = rec.META.relationship(property2).inverseProperty;
    this.inverseProperty = pkInverse;
    const message = `Missing Inverse Property: the model "${this.from}" has defined a relationship with the "${this.to}" model where the FK property is "${property2}" and it states that the "inverse property" is "${pkInverse}" on the ${this.to} model. Unfortunately the ${this.to} model does NOT define a property called "${this.inverseProperty}".`;
    this.message = message;
  }
}

// src/errors/relationships/index.ts

// src/errors/mocks/MockError.ts
class MockError extends Error {
  constructor(message, classification = "firemodel/error") {
    super(message);
    this.firemodel = true;
    const parts = classification.split("/");
    const [type, subType] = parts.length === 1 ? ["firemodel", parts[0]] : parts;
    this.name = `${type}/${subType}`;
    this.code = subType;
  }
}

// src/errors/decorators/index.ts

// src/errors/DynamicPropertiesNotReady.ts
class DynamicPropertiesNotReady extends FireModelError2 {
  constructor(rec, message) {
    message = message ? message : `An attempt to interact with the record ${rec.modelName} in a way that requires that the fully composite key be specified. The required parameters for this model to be ready for this are: ${rec.dynamicPathComponents.join(", ")}.`;
    super(message, "firemodel/dynamic-properties-not-ready");
  }
}

// src/errors/index.ts

// src/watchers/watcherPool.ts
let watcherPool3 = {};
function getWatcherPool() {
  return watcherPool3;
}
function getWatcherPoolList() {
  return hashToArray(getWatcherPool());
}
function addToWatcherPool(item) {
  watcherPool3[item.watcherId] = item;
}
function clearWatcherPool() {
  watcherPool3 = {};
}
function removeFromWatcherPool(code) {
  delete watcherPool3[code];
  return watcherPool3;
}

// src/List.ts
import {
  SerializedQuery
} from "universal-fire";
const DEFAULT_IF_NOT_FOUND = "__DO_NOT_USE__";
function addTimestamps(obj) {
  const datetime2 = new Date().getTime();
  const output = {};
  Object.keys(obj).forEach((i) => {
    output[i] = {
      ...obj[i],
      createdAt: datetime2,
      lastUpdated: datetime2
    };
  });
  return output;
}
class List extends FireModel2 {
  constructor(model3, options = {}) {
    super();
    this._data = [];
    this._modelConstructor = model3;
    this._model = new model3();
    if (options.db) {
      this._db = options.db;
      if (!FireModel2.defaultDb) {
        FireModel2.defaultDb = options.db;
      }
    }
    if (options.offsets) {
      this._offsets = options.offsets;
    }
  }
  static set defaultDb(db) {
    FireModel2.defaultDb = db;
  }
  static get defaultDb() {
    return FireModel2.defaultDb;
  }
  static async set(model3, payload, options = {}) {
    try {
      const m = Record2.create(model3, options);
      if (m.META.audit) {
        const existing = await List.all(model3, options);
        if (existing.length > 0) {
        } else {
        }
      } else {
        const datetime2 = new Date().getTime();
        await FireModel2.defaultDb.set(`${m.META.dbOffset}/${m.pluralName}`, addTimestamps(payload));
      }
      const current = await List.all(model3, options);
      return current;
    } catch (e) {
      const err = new Error(`Problem adding new Record: ${e.message}`);
      err.name = e.name !== "Error" ? e.name : "FireModel";
      throw e;
    }
  }
  static set dispatch(fn) {
    FireModel2.dispatch = fn;
  }
  static create(model3, options) {
    return new List(model3, options);
  }
  static async fromQuery(model3, query, options = {}) {
    const list = List.create(model3, options);
    const path4 = options && options.offsets ? List.dbPath(model3, options.offsets) : List.dbPath(model3);
    query.setPath(path4);
    list._query = query;
    await list.load(query);
    return list;
  }
  static async all(model3, options = {}) {
    const query = SerializedQuery.create(this.defaultDb).orderByChild("lastUpdated");
    const list = await List.fromQuery(model3, query, options);
    return list;
  }
  static async first(model3, howMany, options = {}) {
    const query = SerializedQuery.create(this.defaultDb).orderByChild("createdAt").limitToLast(howMany);
    const list = await List.fromQuery(model3, query, options);
    return list;
  }
  static async recent(model3, howMany, offset = 0, options = {}) {
    const query = SerializedQuery.create(this.defaultDb).orderByChild("lastUpdated").limitToFirst(howMany);
    const list = await List.fromQuery(model3, query, options);
    return list;
  }
  static async since(model3, since, options = {}) {
    if (typeof since !== "number") {
      const e = new Error(`Invalid "since" parameter; value must be number instead got a(n) ${typeof since} [ ${since} ]`);
      e.name = "NotAllowed";
      throw e;
    }
    const query = SerializedQuery.create(this.defaultDb).orderByChild("lastUpdated").startAt(since);
    const list = await List.fromQuery(model3, query, options);
    return list;
  }
  static async inactive(model3, howMany, options = {}) {
    const query = SerializedQuery.create(this.defaultDb).orderByChild("lastUpdated").limitToLast(howMany);
    const list = await List.fromQuery(model3, query, options);
    return list;
  }
  static async last(model3, howMany, options = {}) {
    const query = SerializedQuery.create(this.defaultDb).orderByChild("createdAt").limitToFirst(howMany);
    const list = await List.fromQuery(model3, query, options);
    return list;
  }
  static async find(model3, property2, value, options = {}) {
    const results = await List.where(model3, property2, value, options);
    return results.length > 0 ? results.data[0] : void 0;
  }
  static async bulkPut(model3, records, options = {}) {
    if (!FireModel2.defaultDb.isAdminApi) {
      throw new FireModelError2(`You must use the Admin SDK/API to use the bulkPut feature. This may change in the future but in part because the dispatch functionality is not yet set it is restricted to the Admin API for now.`);
    }
    if (Array.isArray(records)) {
      records = arrayToHash(records);
    }
    const dbPath = List.dbPath(model3, options.offsets);
    await FireModel2.defaultDb.update(dbPath, records);
  }
  static async where(model3, property2, value, options = {}) {
    let operation = "=";
    let val = value;
    if (Array.isArray(value)) {
      val = value[1];
      operation = value[0];
    }
    const query = SerializedQuery.create(this.defaultDb).orderByChild(property2).where(operation, val);
    const list = await List.fromQuery(model3, query, options);
    return list;
  }
  static async ids(model3, ...fks) {
    const promises = [];
    const results = [];
    fks.forEach((fk6) => {
      promises.push(Record2.get(model3, fk6).then((p) => results.push(p.data)));
    });
    await Promise.all(promises);
    const obj = new List(model3);
    obj._data = results;
    return obj;
  }
  static dbPath(model3, offsets) {
    const obj = offsets ? List.create(model3, {offsets}) : List.create(model3);
    return obj.dbPath;
  }
  get query() {
    return this._query;
  }
  get length() {
    return this._data.length;
  }
  get dbPath() {
    const dbOffset = getModelMeta(this._model).dbOffset;
    return [this._injectDynamicDbOffsets(dbOffset), this.pluralName].join("/");
  }
  get localPath() {
    const meta2 = this._model.META || getModelMeta(this._model);
    return pathJoin2(meta2.localPrefix, meta2.localModelName !== this.modelName ? meta2.localModelName : this.pluralName);
  }
  get localPostfix() {
    const meta2 = this._model.META || getModelMeta(this._model);
    return meta2.localPostfix;
  }
  filter(f) {
    const list = List.create(this._modelConstructor);
    list._data = this._data.filter(f);
    return list;
  }
  find(f, defaultIfNotFound = DEFAULT_IF_NOT_FOUND) {
    const filtered = this._data.filter(f);
    const r = Record2.create(this._modelConstructor);
    if (filtered.length > 0) {
      return Record2.createWith(this._modelConstructor, filtered[0]);
    } else {
      if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
        return defaultIfNotFound;
      } else {
        const e = new Error(`find(fn) did not find a value in the List [ length: ${this.data.length} ]`);
        e.name = "NotFound";
        throw e;
      }
    }
  }
  filterWhere(prop, value) {
    const whereFilter = (item) => item[prop] === value;
    const list = new List(this._modelConstructor);
    list._data = this.data.filter(whereFilter);
    return list;
  }
  filterContains(prop, value) {
    return this.filter((item) => Object.keys(item[prop]).includes(value));
  }
  findWhere(prop, value, defaultIfNotFound = DEFAULT_IF_NOT_FOUND) {
    const list = this.META.isProperty(prop) || this.META.isRelationship(prop) && this.META.relationship(prop).relType === "hasOne" ? this.filterWhere(prop, value) : this.filterContains(prop, value);
    if (list.length > 0) {
      return Record2.createWith(this._modelConstructor, list._data[0]);
    } else {
      if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
        return defaultIfNotFound;
      } else {
        const valid = this.META.isProperty(prop) || this.META.isRelationship(prop) && this.META.relationship(prop).relType === "hasOne" ? this.map((i) => i[prop]) : this.map((i) => Object.keys(i[prop]));
        const e = new Error(`List<${this.modelName}>.findWhere(${prop}, ${value}) was not found in the List [ length: ${this.data.length} ]. 

Valid values include: 

${valid.join("	")}`);
        e.name = "NotFound";
        throw e;
      }
    }
  }
  map(f) {
    return this.data.map(f);
  }
  forEach(f) {
    this.data.forEach(f);
  }
  reduce(f, initialValue = {}) {
    return this.data.reduce(f, initialValue);
  }
  get data() {
    return this._data;
  }
  findById(id, defaultIfNotFound = DEFAULT_IF_NOT_FOUND) {
    const find = this.filter((f) => f.id === id);
    if (find.length === 0) {
      if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
        return defaultIfNotFound;
      }
      const e = new Error(`Could not find "${id}" in list of ${this.pluralName}`);
      e.name = "NotFound";
      throw e;
    }
    return Record2.createWith(this._modelConstructor, find.data[0]);
  }
  async removeById(id, ignoreOnNotFound = false) {
    const rec = this.findById(id, null);
    if (!rec) {
      if (!ignoreOnNotFound) {
        throw new FireModelError2(`Could not remove "${id}" in list of ${this.pluralName} as the ID was not found!`, `firemodel/not-allowed`);
      } else {
        return;
      }
    }
    const removed = await Record2.remove(this._modelConstructor, id, rec);
    this._data = this.filter((f) => f.id !== id).data;
  }
  async add(payload) {
    const newRecord = await Record2.add(this._modelConstructor, payload);
    this._data.push(newRecord.data);
    return newRecord;
  }
  getData(id, defaultIfNotFound = DEFAULT_IF_NOT_FOUND) {
    let record;
    try {
      record = this.findById(id, defaultIfNotFound);
      return record === defaultIfNotFound ? defaultIfNotFound : record.data;
    } catch (e) {
      if (e.name === "NotFound" && defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
        return defaultIfNotFound;
      } else {
        throw e;
      }
    }
  }
  async load(pathOrQuery) {
    if (!this.db) {
      const e = new Error(`The attempt to load data into a List requires that the DB property be initialized first!`);
      e.name = "NoDatabase";
      throw e;
    }
    this._data = await this.db.getList(pathOrQuery);
    return this;
  }
  _injectDynamicDbOffsets(dbOffset) {
    if (dbOffset.indexOf(":") === -1) {
      return dbOffset;
    }
    const dynamicPathProps = Record2.dynamicPathProperties(this._modelConstructor);
    Object.keys(this._offsets || {}).forEach((prop) => {
      if (dynamicPathProps.includes(prop)) {
        const value = this._offsets[prop];
        if (!["string", "number"].includes(typeof value)) {
          throw new FireModelError2(`The dynamic dbOffset is using the property "${prop}" on ${this.modelName} as a part of the route path but that property must be either a string or a number and instead was a ${typeof value}`, "record/not-allowed");
        }
        dbOffset = dbOffset.replace(`:${prop}`, String(value));
      }
    });
    if (dbOffset.includes(":")) {
      throw new FireModelError2(`Attempt to get the dbPath of a List where the underlying model [ ${capitalize(this.modelName)} ] has dynamic path segments which were NOT supplied! The offsets provided were "${JSON.stringify(Object.keys(this._offsets || {}))}" but this leaves the following uncompleted dbOffset: ${dbOffset}`);
    }
    return dbOffset;
  }
}

// src/watchers/watchInitialization.ts
const _hasInitialized = {};
const hasInitialized = (watcherId, value = true) => {
  if (watcherId) {
    _hasInitialized[watcherId] = value;
  }
  return _hasInitialized;
};
async function waitForInitialization(watcher, timeout = 750) {
  setTimeout(() => {
    if (!ready(watcher)) {
      console.info(`A watcher [ ${watcher.watcherId} ] has not returned an event in the timeout window  [ ${timeout}ms ]. This might represent an issue but can also happen when a watcher starts listening to a path [ ${watcher.watcherPaths.join(", ")} ] which has no data yet.`);
    }
    hasInitialized(watcher.watcherId, "timed-out");
  }, timeout);
  while (!ready(watcher)) {
    await wait(50);
  }
}
function ready(watcher) {
  return hasInitialized()[watcher.watcherId] ? true : false;
}

// src/watchers/WatchDispatcher.ts
const WatchDispatcher2 = (coreDispatchFn) => (watcherContext) => {
  if (typeof coreDispatchFn !== "function") {
    throw new FireModelError2(`A watcher is being setup but the dispatch function is not a valid function!`, "firemodel/not-allowed");
  }
  return async (event) => {
    const typeLookup = {
      child_added: FmEvents.RECORD_ADDED,
      child_removed: FmEvents.RECORD_REMOVED,
      child_changed: FmEvents.RECORD_CHANGED,
      child_moved: FmEvents.RECORD_MOVED,
      value: FmEvents.RECORD_CHANGED
    };
    let eventContext;
    let errorMessage;
    if (event.kind === "relationship") {
      eventContext = {
        type: event.type,
        dbPath: "not-relevant, use toLocal and fromLocal"
      };
    } else if (event.kind === "watcher") {
    } else {
      if (watcherContext.watcherPaths) {
        const fullPath = watcherContext.watcherPaths.find((i) => i.includes(event.key));
        const compositeKey = Record2.getCompositeKeyFromPath(watcherContext.modelConstructor, fullPath);
        event.value = {...event.value || {}, ...compositeKey};
      }
      const recordProps = typeof event.value === "object" ? {id: event.key, ...event.value} : {id: event.key};
      const rec = Record2.createWith(watcherContext.modelConstructor, recordProps);
      let type;
      switch (event.kind) {
        case "record":
          type = event.type;
          break;
        case "server-event":
          type = event.value === null ? FmEvents.RECORD_REMOVED : typeLookup[event.eventType];
          break;
        default:
          type = FmEvents.UNEXPECTED_ERROR;
          errorMessage = `The "kind" of event was not recognized [ ${event.kind} ]`;
      }
      eventContext = {
        type,
        dbPath: rec.dbPath
      };
    }
    const reduxAction = {
      ...watcherContext,
      ...event,
      ...eventContext
    };
    const results = await coreDispatchFn(reduxAction);
    hasInitialized(watcherContext.watcherId);
    return results;
  };
};

// src/watchers/WatchBase.ts
class WatchBase {
  constructor() {
    this._underlyingRecordWatchers = [];
  }
  async start(options = {}) {
    const isListOfRecords = this._watcherSource === "list-of-records";
    const watchIdPrefix = isListOfRecords ? "wlr" : "w";
    let watchHashCode;
    try {
      watchHashCode = isListOfRecords ? String(this._underlyingRecordWatchers[0]._query.hashCode()) : String(this._query.hashCode());
    } catch (e) {
      throw new FireModelProxyError(e, `An error occured trying to start a watcher. The source was "${this._watcherSource}" and had a query of: ${this._query}

The underlying error was: ${e.message}`, "watcher/not-allowed");
    }
    const watcherId = watchIdPrefix + "-" + watchHashCode;
    this._watcherName = options.name || `${watcherId}`;
    const watcherName = options.name || this._watcherName || `${watcherId}`;
    const watcherItem = this.buildWatcherItem(watcherName);
    const dispatch = WatchDispatcher2(watcherItem.dispatch)(watcherItem);
    if (!this.db) {
      throw new FireModelError2(`Attempt to start a watcher before the database connection has been established!`);
    }
    try {
      if (this._eventType === "value") {
        if (this._watcherSource === "list-of-records") {
          this._underlyingRecordWatchers.forEach((r) => {
            this.db.watch(r._query, ["value"], dispatch);
          });
        } else {
          this.db.watch(this._query, ["value"], dispatch);
        }
      } else {
        if (options.largePayload) {
          const payload = await List.fromQuery(this._modelConstructor, this._query, {offsets: this._options.offsets || {}});
          await dispatch({
            type: FmEvents.WATCHER_SYNC,
            kind: "watcher",
            modelConstructor: this._modelConstructor,
            key: this._query.path.split("/").pop(),
            value: payload.data,
            offsets: this._options.offsets || {}
          });
        }
        this.db.watch(this._query, ["child_added", "child_changed", "child_moved", "child_removed"], dispatch);
      }
    } catch (e) {
      console.log(`Problem starting watcher [${watcherId}]: `, e);
      (this._dispatcher || FireModel2.dispatch)({
        type: FmEvents.WATCHER_FAILED,
        errorMessage: e.message,
        errorCode: e.code || e.name || "firemodel/watcher-failed"
      });
      throw e;
    }
    try {
      addToWatcherPool(watcherItem);
      (this._dispatcher || FireModel2.dispatch)({
        type: FmEvents.WATCHER_STARTING,
        ...watcherItem
      });
      await waitForInitialization(watcherItem);
      await (this._dispatcher || FireModel2.dispatch)({
        type: FmEvents.WATCHER_STARTED,
        ...watcherItem
      });
      return watcherItem;
    } catch (e) {
      throw new FireModelError2(`The watcher "${watcherId}" failed to initialize`, "firemodel/watcher-initialization");
    }
  }
  dispatch(d) {
    this._dispatcher = d;
    return this;
  }
  toString() {
    return `Watching path "${this._query.path}" for "${this._eventType}" event(s) [ hashcode: ${String(this._query.hashCode())} ]`;
  }
  buildWatcherItem(name) {
    const dispatch = this.getCoreDispatch();
    const isListOfRecords = this._watcherSource === "list-of-records";
    const watchIdPrefix = isListOfRecords ? "wlr" : "w";
    const watchHashCode = isListOfRecords ? String(this._underlyingRecordWatchers[0]._query.hashCode()) : String(this._query.hashCode());
    const watcherId = watchIdPrefix + "-" + watchHashCode;
    const watcherName = name || `${watcherId}`;
    const eventFamily = this._watcherSource === "list" ? "child" : "value";
    const watcherPaths = this._watcherSource === "list-of-records" ? this._underlyingRecordWatchers.map((i) => i._query.path) : [this._query.path];
    const query = this._watcherSource === "list-of-records" ? this._underlyingRecordWatchers.map((i) => i._query) : this._query;
    const watchContext = {
      watcherId,
      watcherName,
      eventFamily,
      dispatch,
      modelConstructor: this._modelConstructor,
      query,
      dynamicPathProperties: this._dynamicProperties,
      compositeKey: this._compositeKey,
      localPath: this._localPath,
      localPostfix: this._localPostfix,
      modelName: this._modelName,
      localModelName: this._localModelName || "not-relevant",
      pluralName: this._pluralName,
      watcherPaths,
      watcherSource: this._watcherSource,
      createdAt: new Date().getTime()
    };
    return watchContext;
  }
  getCoreDispatch() {
    const coreDispatch = this._dispatcher || FireModel2.dispatch;
    if (coreDispatch.name === "defaultDispatch") {
      throw new FireModelError2(`Attempt to start a ${this._watcherSource} watcher on "${this._query.path}" but no dispatcher has been assigned. Make sure to explicitly set the dispatch function or use "FireModel.dispatch = xxx" to setup a default dispatch function.`, `firemodel/invalid-dispatch`);
    }
    return coreDispatch;
  }
  get db() {
    if (!this._db) {
      if (FireModel2.defaultDb) {
        this._db = FireModel2.defaultDb;
      }
    }
    return this._db;
  }
}

// src/watchers/WatchList.ts
import {
  SerializedQuery as SerializedQuery2
} from "universal-fire";
class WatchList2 extends WatchBase {
  constructor() {
    super(...arguments);
    this._offsets = {};
    this._options = {};
  }
  static list(modelConstructor, options = {}) {
    const obj = new WatchList2();
    obj.list(modelConstructor, options);
    return obj;
  }
  list(modelConstructor, options = {}) {
    this._watcherSource = "list";
    this._eventType = "child";
    this._options = options;
    if (options.offsets) {
      this._offsets = options.offsets;
    }
    const lst = List.create(modelConstructor, options);
    this._modelConstructor = modelConstructor;
    this._classProperties = getAllPropertiesFromClassStructure(new this._modelConstructor());
    this._dynamicProperties = Record2.dynamicPathProperties(modelConstructor);
    this.setPathDependantProperties();
    return this;
  }
  offsets(offsetDict) {
    this._offsets = offsetDict;
    const lst = List.create(this._modelConstructor, this._options);
    this.setPathDependantProperties();
    return this;
  }
  ids(...ids) {
    if (ids.length === 0) {
      throw new FireModelError2(`You attempted to setup a watcher list on a given set of ID's of "${this._modelName}" but the list of ID's was empty!`, "firemodel/not-ready");
    }
    for (const id of ids) {
      this._underlyingRecordWatchers.push(this._options.offsets ? Watch.record(this._modelConstructor, {
        ...typeof id === "string" ? {id} : id,
        ...this._options.offsets
      }) : Watch.record(this._modelConstructor, id));
    }
    this._watcherSource = "list-of-records";
    this._eventType = "value";
    return this;
  }
  since(when, limit) {
    this._query = this._query.orderByChild("lastUpdated").startAt(when);
    if (limit) {
      this._query = this._query.limitToFirst(limit);
    }
    return this;
  }
  dormantSince(when, limit) {
    this._query = this._query.orderByChild("lastUpdated").endAt(when);
    if (limit) {
      this._query = this._query.limitToFirst(limit);
    }
    return this;
  }
  after(when, limit) {
    this._query = this._query.orderByChild("createdAt").startAt(when);
    if (limit) {
      this._query = this._query.limitToFirst(limit);
    }
    return this;
  }
  before(when, limit) {
    this._query = this._query.orderByChild("createdAt").endAt(when);
    if (limit) {
      this._query = this._query.limitToFirst(limit);
    }
    return this;
  }
  first(howMany, startAt) {
    this._query = this._query.orderByChild("createdAt").limitToFirst(howMany);
    if (startAt) {
      this._query = this._query.startAt(startAt);
    }
    return this;
  }
  last(howMany, startAt) {
    this._query = this._query.orderByChild("createdAt").limitToLast(howMany);
    if (startAt) {
      this._query = this._query.endAt(startAt);
    }
    return this;
  }
  recent(howMany, startAt) {
    this._query = this._query.orderByChild("lastUpdated").limitToFirst(howMany);
    if (startAt) {
      this._query = this._query.startAt(startAt);
    }
    return this;
  }
  inactive(howMany, startAt) {
    this._query = this._query.orderByChild("lastUpdated").limitToLast(howMany);
    if (startAt) {
      this._query = this._query.endAt(startAt);
    }
    return this;
  }
  fromQuery(inputQuery) {
    this._query = inputQuery;
    return this;
  }
  all(limit) {
    if (limit) {
      this._query = this._query.limitToLast(limit);
    }
    return this;
  }
  where(property2, value) {
    let operation = "=";
    let val;
    if (Array.isArray(value)) {
      val = value[1];
      operation = value[0];
    } else {
      val = value;
    }
    this._query = SerializedQuery2.create(this.db, this._query.path).orderByChild(property2).where(operation, val);
    return this;
  }
  setPathDependantProperties() {
    if (this._dynamicProperties.length === 0 || Object.keys(this._offsets).length > 0) {
      const lst = List.create(this._modelConstructor, {
        ...this._options,
        offsets: this._offsets
      });
      this._query = SerializedQuery2.create(this.db, lst.dbPath);
      this._modelName = lst.modelName;
      this._pluralName = lst.pluralName;
      this._localPath = lst.localPath;
      this._localPostfix = lst.localPostfix;
    }
  }
}

// src/watchers/WatchRecord.ts
import {SerializedQuery as SerializedQuery3} from "universal-fire";
class WatchRecord2 extends WatchBase {
  static record(modelConstructor, pk6, options = {}) {
    if (!pk6) {
      throw new FireModelError2(`Attempt made to watch a RECORD but no primary key was provided!`, "firemodel/no-pk");
    }
    const o = new WatchRecord2();
    if (o.db) {
      o._db = options.db;
    }
    o._eventType = "value";
    o._watcherSource = "record";
    const r = Record2.createWith(modelConstructor, pk6, options.db ? {db: options.db} : {});
    o._query = SerializedQuery3.create(options.db || FireModel2.defaultDb, `${r.dbPath}`);
    o._modelConstructor = modelConstructor;
    o._modelName = r.modelName;
    o._localModelName = r.META.localModelName;
    o._pluralName = r.pluralName;
    o._localPath = r.localPath;
    o._localPostfix = r.META.localPostfix;
    o._dynamicProperties = r.dynamicPathComponents;
    o._compositeKey = r.compositeKey;
    return o;
  }
}

// src/Watch.ts
class Watch {
  static set defaultDb(db) {
    FireModel2.defaultDb = db;
  }
  static set dispatch(d) {
    FireModel2.dispatch = d;
  }
  static get inventory() {
    return getWatcherPool();
  }
  static toJSON() {
    return Watch.inventory;
  }
  static lookup(hashCode) {
    const codes = new Set(Object.keys(getWatcherPool()));
    if (!codes.has(hashCode)) {
      const e = new Error(`You looked up an invalid watcher hashcode [${hashCode}].`);
      e.name = "FireModel::InvalidHashcode";
      throw e;
    }
    return getWatcherPool()[hashCode];
  }
  static get watchCount() {
    return Object.keys(getWatcherPool()).length;
  }
  static reset() {
    clearWatcherPool();
  }
  static findByName(name) {
    const pool = getWatcherPool();
    return Object.keys(pool).find((i) => pool[i].watcherName === name);
  }
  static stop(hashCode, oneOffDB) {
    const codes = new Set(Object.keys(getWatcherPool()));
    const db = oneOffDB || FireModel2.defaultDb;
    if (!db) {
      throw new FireModelError2(`There is no established way to connect to the database; either set the default DB or pass the DB in as the second parameter to Watch.stop()!`, `firemodel/no-database`);
    }
    if (hashCode && !codes.has(hashCode)) {
      const e = new FireModelError2(`The hashcode passed into the stop() method [ ${hashCode} ] is not actively being watched!`);
      e.name = "firemodel/missing-hashcode";
      throw e;
    }
    if (!hashCode) {
      const pool = getWatcherPool();
      if (Object.keys(pool).length > 0) {
        const keysAndPaths = Object.keys(pool).reduce((agg, key2) => ({...agg, [key2]: pool[key2].watcherPaths}), {});
        const dispatch = pool[firstKey(pool)].dispatch;
        db.unWatch();
        clearWatcherPool();
        dispatch({
          type: FmEvents.WATCHER_STOPPED_ALL,
          stopped: keysAndPaths
        });
      }
    } else {
      const registry = getWatcherPool()[hashCode];
      const events3 = registry.eventFamily === "child" ? "value" : ["child_added", "child_changed", "child_moved", "child_removed"];
      db.unWatch(events3, registry.dispatch);
      registry.dispatch({
        type: FmEvents.WATCHER_STOPPED,
        watcherId: hashCode,
        remaining: getWatcherPoolList().map((i) => ({
          id: i.watcherId,
          name: i.watcherName
        }))
      });
      removeFromWatcherPool(hashCode);
    }
  }
  static record(modelConstructor, pk6, options = {}) {
    return WatchRecord2.record(modelConstructor, pk6, options);
  }
  static list(modelConstructor, offsets) {
    return WatchList2.list(modelConstructor, {offsets});
  }
}

// src/watchers/findWatchers.ts
function findWatchers2(dbPath) {
  const inspectListofRecords = (watcher) => {
    const paths = watcher.watcherPaths;
    let found = false;
    paths.forEach((p) => {
      if (dbPath.includes(p)) {
        found = true;
      }
    });
    return found;
  };
  return hashToArray(Watch.inventory).filter((i) => i.watcherSource === "list-of-records" ? inspectListofRecords(i) : dbPath.includes(i.query.path));
}

// src/verifications/isHasManyRelationship.ts
function isHasManyRelationship2(rec, property2) {
  return rec.META.relationship(property2).relType === "hasMany" ? true : false;
}

// src/record/createCompositeKeyString.ts
function createCompositeKeyRefFromRecord(rec) {
  const cKey = createCompositeKey(rec);
  return rec.hasDynamicPath ? createCompositeRef(cKey) : rec.id;
}
function createCompositeRef(cKey) {
  return Object.keys(cKey).length > 1 ? cKey.id + Object.keys(cKey).filter((k) => k !== "id").map((k) => `::${k}:${cKey[k]}`) : cKey.id;
}

// src/record/relationships/buildRelationshipPaths.ts
function buildRelationshipPaths2(rec, property2, fkRef, options = {}) {
  try {
    const meta2 = getModelMeta(rec);
    const now = options.now || new Date().getTime();
    const operation = options.operation || "add";
    const altHasManyValue = options.altHasManyValue || true;
    const fkModelConstructor = meta2.relationship(property2).fkConstructor();
    const inverseProperty = meta2.relationship(property2).inverseProperty;
    const fkRecord = Record2.createWith(fkModelConstructor, fkRef, {db: rec.db});
    const results = [];
    const fkCompositeKey = typeof fkRef === "object" ? fkRef : fkRecord.compositeKey;
    const fkId = createCompositeKeyRefFromRecord(fkRecord);
    const hasManyReln = meta2.isRelationship(property2) && meta2.relationship(property2).relType === "hasMany";
    const pathToRecordsFkReln = pathJoin(rec.dbPath, property2, hasManyReln ? fkId : "");
    results.push({
      path: pathToRecordsFkReln,
      value: operation === "remove" ? null : hasManyReln ? altHasManyValue : fkId
    });
    results.push({path: pathJoin(rec.dbPath, "lastUpdated"), value: now});
    if (inverseProperty) {
      const fkMeta = getModelMeta(fkRecord);
      const inverseReln = fkMeta.relationship(inverseProperty);
      if (!inverseReln) {
        throw new MissingInverseProperty(rec, property2);
      }
      if (!inverseReln.inverseProperty && inverseReln.directionality === "bi-directional") {
        throw new MissingReciprocalInverse2(rec, property2);
      }
      if (inverseReln.inverseProperty !== property2 && inverseReln.directionality === "bi-directional") {
        throw new IncorrectReciprocalInverse(rec, property2);
      }
      const fkInverseIsHasManyReln = inverseProperty ? fkMeta.relationship(inverseProperty).relType === "hasMany" : false;
      const pathToInverseFkReln = fkInverseIsHasManyReln ? pathJoin(fkRecord.dbPath, inverseProperty, rec.compositeKeyRef) : pathJoin(fkRecord.dbPath, inverseProperty);
      results.push({
        path: pathToInverseFkReln,
        value: operation === "remove" ? null : fkInverseIsHasManyReln ? altHasManyValue : rec.compositeKeyRef
      });
      results.push({
        path: pathJoin(fkRecord.dbPath, "lastUpdated"),
        value: now
      });
    }
    return results;
  } catch (e) {
    if (e.firemodel) {
      console.log(e);
      throw e;
    }
    throw new UnknownRelationshipProblem(e, rec, property2);
  }
}

// src/record/locallyUpdateFkOnRecord.ts
function locallyUpdateFkOnRecord(rec, fkId, event) {
  const relnType = rec.META.relationship(event.property).relType;
  rec.set("lastUpdated", new Date().getTime(), true);
  switch (event.operation) {
    case "set":
    case "add":
      rec._data[event.property] = relnType === "hasMany" ? {...rec.data[event.property], ...{[fkId]: true}} : fkId;
      return;
    case "remove":
      if (relnType === "hasMany") {
        delete rec._data[event.property][fkId];
      } else {
        rec._data[event.property] = "";
      }
      return;
  }
}

// src/record/relationshipOperation.ts
async function relationshipOperation2(rec, operation, property2, fkRefs, paths, options = {}) {
  const fks = fkRefs.map((fk6) => {
    return typeof fk6 === "object" ? createCompositeRef(fk6) : fk6;
  });
  const dispatchEvents = {
    set: [
      FmEvents.RELATIONSHIP_SET_LOCALLY,
      FmEvents.RELATIONSHIP_SET_CONFIRMATION,
      FmEvents.RELATIONSHIP_SET_ROLLBACK
    ],
    clear: [
      FmEvents.RELATIONSHIP_REMOVED_LOCALLY,
      FmEvents.RELATIONSHIP_REMOVED_CONFIRMATION,
      FmEvents.RELATIONSHIP_REMOVED_ROLLBACK
    ],
    add: [
      FmEvents.RELATIONSHIP_ADDED_LOCALLY,
      FmEvents.RELATIONSHIP_ADDED_CONFIRMATION,
      FmEvents.RELATIONSHIP_ADDED_ROLLBACK
    ],
    remove: [
      FmEvents.RELATIONSHIP_REMOVED_LOCALLY,
      FmEvents.RELATIONSHIP_REMOVED_CONFIRMATION,
      FmEvents.RELATIONSHIP_REMOVED_ROLLBACK
    ]
  };
  try {
    const [localEvent, confirmEvent, rollbackEvent] = dispatchEvents[operation];
    const fkConstructor = rec.META.relationship(property2).fkConstructor;
    const fkRecord = new Record2(fkConstructor());
    const fkMeta = getModelMeta(fkRecord.data);
    const transactionId = "t-reln-" + Math.random().toString(36).substr(2, 5) + "-" + Math.random().toString(36).substr(2, 5);
    const event = {
      key: rec.compositeKeyRef,
      operation,
      property: property2,
      kind: "relationship",
      eventType: "local",
      transactionId,
      fks,
      paths,
      from: capitalize(rec.modelName),
      to: capitalize(fkRecord.modelName),
      fromLocal: rec.localPath,
      toLocal: fkRecord.localPath,
      fromConstructor: rec.modelConstructor,
      toConstructor: fkRecord.modelConstructor
    };
    const inverseProperty = rec.META.relationship(property2).inverseProperty;
    if (inverseProperty) {
      event.inverseProperty = inverseProperty;
    }
    try {
      await localRelnOp(rec, event, localEvent);
      await relnConfirmation(rec, event, confirmEvent);
    } catch (e) {
      await relnRollback(rec, event, rollbackEvent);
      throw new FireModelProxyError(e, `Encountered an error executing a relationship operation between the "${event.from}" model and "${event.to}". The paths that were being modified were: ${event.paths.map((i) => i.path).join("- \n")}
 A dispatch for a rollback event has been issued.`);
    }
  } catch (e) {
    if (e.firemodel) {
      throw e;
    } else {
      throw new UnknownRelationshipProblem(e, rec, property2, operation);
    }
  }
}
async function localRelnOp(rec, event, type) {
  try {
    event.fks.map((fk6) => {
      locallyUpdateFkOnRecord(rec, fk6, {...event, type});
    });
    rec.dispatch({...event, type});
    const ref = rec.db.ref("/");
    await ref.update(event.paths.reduce((acc, curr) => {
      acc[curr.path] = curr.value;
      return acc;
    }, {}));
  } catch (e) {
    throw new FireModelProxyError(e, `While operating doing a local relationship operation ran into an error. Note that the "paths" passed in were:
${JSON.stringify(event.paths)}.

The underlying error message was:`);
  }
}
async function relnConfirmation(rec, event, type) {
  rec.dispatch({...event, type});
}
async function relnRollback(rec, event, type) {
  rec.dispatch({...event, type});
}

// src/record/createCompositeKeyFromFkString.ts
function createCompositeKeyFromFkString2(fkCompositeRef, modelConstructor) {
  const [id, ...paramsHash] = fkCompositeRef.split("::");
  const model3 = modelConstructor ? new modelConstructor() : void 0;
  return paramsHash.map((i) => i.split(":")).reduce((acc, curr) => {
    const [prop, value] = curr;
    acc[prop] = model3 ? setWithType(prop, value, model3) : value;
    return acc;
  }, {id});
}
function setWithType(prop, value, model3) {
  if (!model3.META.property(prop)) {
    throw new FireModelError2(`When building a "typed" composite key based on the model ${capitalize(model3.constructor.name)}, the property "${prop}" was presented but this property doesn't exist on this model!`, "firemodel/property-does-not-exist");
  }
  const type = model3.META.property(prop).type;
  switch (type) {
    case "number":
      return Number(value);
    case "boolean":
      return Boolean(value);
    default:
      return value;
  }
}

// src/errors/record/DatabaseCrudFailure.ts
class RecordCrudFailure extends FireModelError2 {
  constructor(rec, crudAction, transactionId, e) {
    super("", e.name !== "Error" ? e.name : `firemodel/record-${crudAction}-failure`);
    const message = `Attempt to "${crudAction}" "${capitalize(rec.modelName)}::${rec.id}" failed [ ${transactionId} ] ${e ? e.message : "for unknown reasons"}`;
    this.message = message;
    this.stack = e.stack;
  }
}

// src/state-mgmt/UnwatchedLocalEvent.ts
function UnwatchedLocalEvent2(rec, event) {
  const meta2 = {
    dynamicPathProperties: rec.dynamicPathComponents,
    compositeKey: rec.compositeKey,
    modelConstructor: rec.modelConstructor,
    modelName: rec.modelName,
    pluralName: rec.pluralName,
    localModelName: rec.META.localModelName,
    localPath: rec.localPath,
    localPostfix: rec.META.localPostfix
  };
  return {...event, ...meta2, dbPath: rec.dbPath, watcherSource: "unknown"};
}

// src/Record.ts
const fast_copy = __toModule(require_fast_copy());
class Record2 extends FireModel2 {
  constructor(model3, options = {}) {
    super();
    this.options = options;
    this._existsOnDB = false;
    this._writeOperations = [];
    this._data = {};
    if (!model3) {
      throw new FireModelError2(`You are trying to instantiate a Record but the "model constructor" passed in is empty!`, `firemodel/not-allowed`);
    }
    if (!model3.constructor) {
      console.log(`The "model" property passed into the Record constructor is NOT a Model constructor! It is of type "${typeof model3}": `, model3);
      if (typeof model3 === "string") {
        model3 = FireModel2.lookupModel(model3);
        if (!model3) {
          throw new FireModelError2(`Attempted to lookup the model in the registry but it was not found!`);
        }
      } else {
        throw new FireModelError2(`Can not instantiate a Record without a valid Model constructor`);
      }
    }
    this._modelConstructor = model3;
    this._model = new model3();
    this._data = new model3();
  }
  static set defaultDb(db) {
    FireModel2.defaultDb = db;
  }
  static get defaultDb() {
    return FireModel2.defaultDb;
  }
  static set dispatch(fn) {
    FireModel2.dispatch = fn;
  }
  static dynamicPathProperties(model3) {
    return Record2.create(model3).dynamicPathComponents;
  }
  static create(model3, options = {}) {
    const r = new Record2(model3, options);
    if (options.silent && !r.db.isMockDb) {
      throw new FireModelError2(`You can only add new records to the DB silently when using a Mock database!`, "forbidden");
    }
    return r;
  }
  static local(model3, values, options = {}) {
    const rec = Record2.create(model3, options);
    if (!options.ignoreEmptyValues && (!values || Object.keys(values).length === 0)) {
      throw new FireModelError2("You used the static Record.local() method but passed nothing into the 'values' property! If you just want to skip this error then you can set the options to { ignoreEmptyValues: true } or just use the Record.create() method.", `firemodel/record::local`);
    }
    if (values) {
      const defaultValues = rec.META.properties.filter((i) => i.defaultValue !== void 0);
      defaultValues.forEach((i) => {
        if (rec.get(i.property) === void 0) {
          rec.set(i.property, i.defaultValue, true);
        }
      });
    }
    return rec;
  }
  static async add(model3, payload, options = {}) {
    let r;
    if (typeof model3 === "string") {
      model3 = FireModel2.lookupModel(model3);
    }
    try {
      if (!model3) {
        throw new FireModelError2(`The model passed into the Record.add() static initializer was not defined! This is often the result of a circular dependency. Note that the "payload" sent into Record.add() was:

${JSON.stringify(payload, null, 2)}`);
      }
      r = Record2.createWith(model3, payload, options);
      if (!payload.id) {
        const path4 = List.dbPath(model3, payload);
        payload.id = await r.db.getPushKey(path4);
      }
      await r._initialize(payload, options);
      const defaultValues = r.META.properties.filter((i) => i.defaultValue !== void 0);
      defaultValues.forEach((i) => {
        if (r.get(i.property) === void 0) {
          r.set(i.property, i.defaultValue, true);
        }
      });
      await r._adding(options);
    } catch (e) {
      if (e.code === "permission-denied") {
        const rec = Record2.createWith(model3, payload);
        throw new FireModelError2(`Permission error while trying to add the ${capitalize(rec.modelName)} to the database path ${rec.dbPath}`, "firemodel/permission-denied");
      }
      if (e.name.includes("firemodel")) {
        throw e;
      }
      throw new FireModelProxyError(e, "Failed to add new record ");
    }
    return r;
  }
  static async update(model3, id, updates, options = {}) {
    let r;
    try {
      r = await Record2.get(model3, id, options);
      await r.update(updates);
    } catch (e) {
      const err = new Error(`Problem adding new Record: ${e.message}`);
      err.name = e.name !== "Error" ? e.name : "FireModel";
      throw e;
    }
    return r;
  }
  static async pushKey(model3, id, property2, payload, options = {}) {
    const obj = await Record2.get(model3, id, options);
    return obj.pushKey(property2, payload);
  }
  static createWith(model3, payload, options = {}) {
    const rec = Record2.create(model3, options);
    if (options.setDeepRelationships === true) {
      throw new FireModelError2(`Trying to create a ${capitalize(rec.modelName)} with the "setDeepRelationships" property set. This is NOT allowed; consider the 'Record.add()' method instead.`, "not-allowed");
    }
    const properties = typeof payload === "string" ? createCompositeKeyFromFkString2(payload, rec.modelConstructor) : payload;
    rec._initialize(properties, options);
    return rec;
  }
  static async get(model3, id, options = {}) {
    const record = Record2.create(model3, options);
    await record._getFromDB(id);
    return record;
  }
  static async remove(model3, id, currentState) {
    const record = currentState ? currentState : await Record2.get(model3, id);
    await record.remove();
    return record;
  }
  static async associate(model3, id, property2, refs) {
    const obj = await Record2.get(model3, id);
    await obj.associate(property2, refs);
    return obj;
  }
  static getCompositeKeyFromPath(model3, path4) {
    if (!path4) {
      return {};
    }
    const r = Record2.create(model3);
    const pathParts = dotNotation(path4).split(".");
    const compositeKey = {};
    const segments = dotNotation(r.dbOffset).split(".");
    if (segments.length > pathParts.length || pathParts.length - 2 > segments.length) {
      throw new FireModelError2(`Attempt to get the composite key from a path failed due to the diparity of segments in the path [ ${pathParts.length} ] versus the dynamic path [ ${segments.length} ]`, "firemodel/not-allowed");
    }
    segments.forEach((segment, idx) => {
      if (segment.slice(0, 1) === ":") {
        const name = segment.slice(1);
        const value = pathParts[idx];
        compositeKey[name] = value;
      } else {
        if (segment !== pathParts[idx]) {
          throw new FireModelError2(`The attempt to build a composite key for the model ${capitalize(r.modelName)} failed because the static parts of the path did not match up. Specifically where the "dbOffset" states the segment "${segment}" the path passed in had "${pathParts[idx]}" instead.`);
        }
      }
      if (pathParts.length - 1 === segments.length) {
        compositeKey.id = pathParts.slice(-1);
      }
    });
    return compositeKey;
  }
  static compositeKey(model3, obj) {
    const dynamicSegments = Record2.dynamicPathProperties(model3).concat("id");
    return dynamicSegments.reduce((agg, prop) => {
      if (obj[prop] === void 0) {
        throw new FireModelError2(`You used attempted to generate a composite key of the model ${Record2.modelName(model3)} but the property "${prop}" is part of they dynamic path and the data passed in did not have a value for this property.`, "firemodel/not-ready");
      }
      agg[prop] = obj[prop];
      return agg;
    }, {});
  }
  static compositeKeyRef(model3, object) {
    if (Record2.dynamicPathProperties(model3).length === 0) {
      return typeof object === "string" ? object : object.id;
    }
    if (typeof object === "string") {
      if (object.includes(":")) {
        return object;
      } else {
        throw new FireModelError2(`Attempt to get a compositeKeyRef() but passed in a string/id value instead of a composite key for a model [ ${Record2.modelName(model3)}, "${object}" ] which HAS dynamic properties! Required props are: ${Record2.dynamicPathProperties(model3).join(", ")}`, "not-allowed");
      }
    }
    const compositeKey = Record2.compositeKey(model3, object);
    const nonIdKeys = Object.keys(compositeKey).reduce((agg, prop) => prop === "id" ? agg : agg.concat({prop, value: compositeKey[prop]}), []);
    return `${compositeKey.id}::${nonIdKeys.map((tuple) => `${tuple.prop}:${tuple.value}`).join("::")}`;
  }
  static modelName(model3) {
    const r = Record2.create(model3);
    return capitalize(r.modelName);
  }
  get data() {
    return this._data;
  }
  get isDirty() {
    return this.META.isDirty ? true : false;
  }
  set isDirty(value) {
    if (!this._data.META) {
      this._data.META = {isDirty: value};
    }
    this._data.META.isDirty = value;
  }
  get dbPath() {
    if (this.data.id ? false : true) {
      throw new FireModelError2(`you can not ask for the dbPath before setting an "id" property [ ${this.modelName} ]`, "record/not-ready");
    }
    return [
      this._injectDynamicPathProperties(this.dbOffset),
      this.pluralName,
      this.data.id
    ].join("/");
  }
  get hasDynamicPath() {
    return this.META.dbOffset.includes(":");
  }
  get dynamicPathComponents() {
    return this._findDynamicComponents(this.META.dbOffset);
  }
  get localDynamicComponents() {
    return this._findDynamicComponents(this.META.localPrefix);
  }
  get compositeKey() {
    return createCompositeKey(this);
  }
  get compositeKeyRef() {
    return createCompositeKeyRefFromRecord(this);
  }
  get id() {
    return this.data.id;
  }
  set id(val) {
    if (this.data.id) {
      throw new FireModelError2(`You may not re-set the ID of a record [ ${this.modelName}.id ${this.data.id} => ${val} ].`, "firemodel/not-allowed");
    }
    this._data.id = val;
  }
  get dbOffset() {
    return getModelMeta(this).dbOffset;
  }
  get localPath() {
    let prefix = this.localPrefix;
    this.localDynamicComponents.forEach((prop) => {
      prefix = prefix.replace(`:${prop}`, this.get(prop));
    });
    return pathJoin2(prefix, this.META.localModelName !== this.modelName ? this.META.localModelName : this.options.pluralizeLocalPath ? this.pluralName : this.modelName);
  }
  get localPrefix() {
    return getModelMeta(this).localPrefix;
  }
  get existsOnDB() {
    return this.data && this.data.id ? true : false;
  }
  get isBeingWatched() {
    return FireModel2.isBeingWatched(this.dbPath);
  }
  get modelConstructor() {
    return this._modelConstructor;
  }
  async reload() {
    const reloaded = await Record2.get(this._modelConstructor, this.compositeKeyRef);
    return reloaded;
  }
  async addAnother(payload, options = {}) {
    const newRecord = await Record2.add(this._modelConstructor, payload, options);
    return newRecord;
  }
  isSameModelAs(model3) {
    return this._modelConstructor === model3;
  }
  async pushKey(property2, value) {
    if (this.META.pushKeys.indexOf(property2) === -1) {
      throw new FireModelError2(`Invalid Operation: you can not push to property "${property2}" as it has not been declared a pushKey property in the schema`, "invalid-operation/not-pushkey");
    }
    if (!this.existsOnDB) {
      throw new FireModelError2(`Invalid Operation: you can not push to property "${property2}" before saving the record to the database`, "invalid-operation/not-on-db");
    }
    const key2 = this.db.isMockDb ? key() : await this.db.getPushKey(pathJoin2(this.dbPath, property2));
    await this.db.update(pathJoin2(this.dbPath, property2), {
      [pathJoin2(this.dbPath, property2, key2)]: value,
      [pathJoin2(this.dbPath, "lastUpdated")]: new Date().getTime()
    });
    const currentState = this.get(property2) || {};
    const newState = {...currentState, [key2]: value};
    await this.set(property2, newState);
    return key2;
  }
  async update(props2) {
    const meta2 = getModelMeta(this);
    if (!meta2.property) {
      throw new FireModelError2(`There is a problem with this record's META information [ model: ${capitalize(this.modelName)}, id: ${this.id} ]. The property() method -- used to dig into properties on any given model appears to be missing!`, "firemodel/meta-missing");
    }
    if (Object.keys(props2).some((key2) => {
      const root = key2.split(".")[0];
      const rootProperties = meta2.property(root);
      if (!rootProperties) {
        throw new FireModelError2(`While this record [ model: ${capitalize(this.modelName)}, id: ${this.id} ] does return a "META.property" function, looking up the property "${root}" has resulted in an invalid response [${typeof rootProperties}]`);
      }
      return rootProperties.isRelationship;
    })) {
      const relProps = Object.keys(props2).filter((p) => meta2.property(p).isRelationship);
      throw new FireModelError2(`You called update on a hash which has relationships included in it. Please only use "update" for updating properties. The relationships you were attempting to update were: ${relProps.join(", ")}.`, `firemodel/not-allowed`);
    }
    const lastUpdated = new Date().getTime();
    const changed = {
      ...props2,
      lastUpdated
    };
    const rollback = fast_copy.default(this.data);
    this._data = {...this.data, ...changed};
    await this._localCrudOperation(IFmCrudOperations.update, rollback);
    return;
  }
  async remove() {
    this.isDirty = true;
    await this._localCrudOperation(IFmCrudOperations.remove, fast_copy.default(this.data));
    this.isDirty = false;
  }
  async set(prop, value, silent = false) {
    const rollback = fast_copy.default(this.data);
    const meta2 = this.META.property(prop);
    if (!meta2) {
      throw new FireModelError2(`There was a problem getting the meta data for the model ${capitalize(this.modelName)} while attempting to set the "${prop}" property to: ${value}`);
    }
    if (meta2.isRelationship) {
      throw new FireModelError2(`You can not "set" the property "${prop}" because it is configured as a relationship!`, "firemodel/not-allowed");
    }
    const lastUpdated = new Date().getTime();
    const changed = {
      [prop]: value,
      lastUpdated
    };
    this.META.isDirty = true;
    this._data = {...this._data, ...changed};
    if (!silent) {
      await this._localCrudOperation(IFmCrudOperations.update, rollback, {
        silent
      });
      this.META.isDirty = false;
    }
    return;
  }
  async associate(property2, refs, options = {}) {
    const meta2 = getModelMeta(this);
    if (!meta2.relationship(property2)) {
      throw new FireModelError2(`Attempt to associate the property "${property2}" can not be done on model ${capitalize(this.modelName)} because the property is not defined!`, `firemodel/not-allowed`);
    }
    if (!meta2.relationship(property2).relType) {
      throw new FireModelError2(`For some reason the property "${property2}" on the model ${capitalize(this.modelName)} doesn't have cardinality assigned to the "relType" (aka, hasMany, hasOne).

The META for relationships on the model are: ${JSON.stringify(meta2.relationships, null, 2)}`, `firemodel/unknown`);
    }
    const relType = meta2.relationship(property2).relType;
    if (relType === "hasMany") {
      await this.addToRelationship(property2, refs, options);
    } else {
      if (Array.isArray(refs)) {
        if (refs.length === 1) {
          refs = refs.pop();
        } else {
          throw new FireModelError2(`Attempt to use "associate()" with a "hasOne" relationship [ ${property2}] on the model ${capitalize(this.modelName)}.`, "firemodel/invalid-cardinality");
        }
      }
      await this.setRelationship(property2, refs, options);
    }
  }
  async disassociate(property2, refs, options = {}) {
    const relType = this.META.relationship(property2).relType;
    if (relType === "hasMany") {
      await this.removeFromRelationship(property2, refs, options);
    } else {
      await this.clearRelationship(property2, options);
    }
  }
  async addToRelationship(property2, fkRefs, options = {}) {
    const altHasManyValue = options.altHasManyValue || true;
    if (!isHasManyRelationship2(this, property2)) {
      throw new NotHasManyRelationship(this, property2, "addToRelationship");
    }
    fkRefs = Array.isArray(fkRefs) ? fkRefs : [fkRefs];
    let paths = [];
    const now = new Date().getTime();
    fkRefs.map((ref) => {
      paths = [
        ...buildRelationshipPaths2(this, property2, ref, {
          now,
          altHasManyValue
        }),
        ...paths
      ];
    });
    await relationshipOperation2(this, "add", property2, fkRefs, paths, options);
  }
  async removeFromRelationship(property2, fkRefs, options = {}) {
    if (!isHasManyRelationship2(this, property2)) {
      throw new NotHasManyRelationship(this, property2, "removeFromRelationship");
    }
    fkRefs = Array.isArray(fkRefs) ? fkRefs : [fkRefs];
    let paths = [];
    const now = new Date().getTime();
    fkRefs.map((ref) => {
      paths = [
        ...buildRelationshipPaths2(this, property2, ref, {
          now,
          operation: "remove"
        }),
        ...paths
      ];
    });
    await relationshipOperation2(this, "remove", property2, fkRefs, paths, options);
  }
  async clearRelationship(property2, options = {}) {
    const relType = this.META.relationship(property2).relType;
    const fkRefs = relType === "hasMany" ? this._data[property2] ? Object.keys(this.get(property2)) : [] : this._data[property2] ? [this.get(property2)] : [];
    let paths = [];
    const now = new Date().getTime();
    fkRefs.map((ref) => {
      paths = [
        ...buildRelationshipPaths2(this, property2, ref, {
          now,
          operation: "remove"
        }),
        ...paths
      ];
    });
    await relationshipOperation2(this, "clear", property2, fkRefs, paths, options);
  }
  async setRelationship(property2, fkId, options = {}) {
    if (!fkId) {
      throw new FireModelError2(`Failed to set the relationship ${this.modelName}.${property2} because no FK was passed in!`, "firemodel/not-allowed");
    }
    if (isHasManyRelationship2(this, property2)) {
      throw new NotHasOneRelationship(this, property2, "setRelationship");
    }
    const paths = buildRelationshipPaths2(this, property2, fkId);
    await relationshipOperation2(this, "set", property2, [fkId], paths, options);
  }
  get(prop) {
    return this.data[prop];
  }
  toString() {
    return `Record::${this.modelName}@${this.id || "undefined"}`;
  }
  toJSON() {
    return {
      dbPath: this.dbPath,
      modelName: this.modelName,
      pluralName: this.pluralName,
      key: this.id,
      compositeKey: this.compositeKey,
      localPath: this.localPath,
      data: this.data.toString()
    };
  }
  async _initialize(data, options = {}) {
    if (data) {
      Object.keys(data).map((key2) => {
        this._data[key2] = data[key2];
      });
    }
    const relationships = getModelMeta(this).relationships;
    const hasOneRels = (relationships || []).filter((r) => r.relType === "hasOne").map((r) => r.property);
    const hasManyRels = (relationships || []).filter((r) => r.relType === "hasMany").map((r) => r.property);
    const promises = [];
    for (const oneToManyProp of hasManyRels) {
      if (!this._data[oneToManyProp]) {
        this._data[oneToManyProp] = {};
      }
      if (options.setDeepRelationships) {
        if (this._data[oneToManyProp]) {
          promises.push(buildDeepRelationshipLinks2(this, oneToManyProp));
        }
      }
    }
    await Promise.all(promises);
    const now = new Date().getTime();
    if (!this._data.lastUpdated) {
      this._data.lastUpdated = now;
    }
    if (!this._data.createdAt) {
      this._data.createdAt = now;
    }
  }
  async _writeAudit(action, currentValue, priorValue) {
    currentValue = currentValue ? currentValue : {};
    priorValue = priorValue ? priorValue : {};
    try {
      if (this.META.audit) {
        const deltas = compareHashes(currentValue, priorValue);
        const auditLogEntries = [];
        const added = deltas.added.forEach((a) => auditLogEntries.push({
          action: "added",
          property: a,
          before: null,
          after: currentValue[a]
        }));
        deltas.changed.forEach((c) => auditLogEntries.push({
          action: "updated",
          property: c,
          before: priorValue[c],
          after: currentValue[c]
        }));
        const removed = deltas.removed.forEach((r) => auditLogEntries.push({
          action: "removed",
          property: r,
          before: priorValue[r],
          after: null
        }));
        const pastTense = {
          add: "added",
          update: "updated",
          remove: "removed"
        };
        await writeAudit(this, pastTense[action], auditLogEntries, {db: this.db});
      }
    } catch (e) {
      throw new FireModelProxyError(e);
    }
  }
  async _localCrudOperation(crudAction, priorValue, options = {}) {
    options = {
      ...{silent: false, silentAcceptance: false},
      ...options
    };
    const transactionId = "t-" + Math.random().toString(36).substr(2, 5) + "-" + Math.random().toString(36).substr(2, 5);
    const lookup = {
      add: [
        FmEvents.RECORD_ADDED_LOCALLY,
        FmEvents.RECORD_ADDED_CONFIRMATION,
        FmEvents.RECORD_ADDED_ROLLBACK
      ],
      update: [
        FmEvents.RECORD_CHANGED_LOCALLY,
        FmEvents.RECORD_CHANGED_CONFIRMATION,
        FmEvents.RECORD_CHANGED_ROLLBACK
      ],
      remove: [
        FmEvents.RECORD_REMOVED_LOCALLY,
        FmEvents.RECORD_REMOVED_CONFIRMATION,
        FmEvents.RECORD_REMOVED_ROLLBACK
      ]
    };
    const [actionTypeStart, actionTypeEnd, actionTypeFailure] = lookup[crudAction];
    this.isDirty = true;
    const {changed, added, removed} = compareHashes(withoutMetaOrPrivate(this.data), withoutMetaOrPrivate(priorValue));
    const watchers = findWatchers2(this.dbPath);
    const event = {
      transactionId,
      modelConstructor: this.modelConstructor,
      kind: "record",
      operation: crudAction,
      eventType: "local",
      key: this.id,
      value: withoutMetaOrPrivate(this.data),
      priorValue
    };
    if (crudAction === "update") {
      event.priorValue = priorValue;
      event.added = added;
      event.changed = changed;
      event.removed = removed;
    }
    if (watchers.length === 0) {
      if (!options.silent) {
        await this.dispatch(UnwatchedLocalEvent2(this, {
          type: actionTypeStart,
          ...event,
          value: withoutMetaOrPrivate(this.data)
        }));
      }
    } else {
      const dispatch = WatchDispatcher2(this.dispatch);
      for (const watcher of watchers) {
        if (!options.silent) {
          await dispatch(watcher)({type: actionTypeStart, ...event});
        }
      }
    }
    try {
      if (this.db.isMockDb && this.db.mock && options.silent) {
        this.db.mock.silenceEvents();
      }
      this._data.lastUpdated = new Date().getTime();
      const path4 = this.dbPath;
      switch (crudAction) {
        case "remove":
          try {
            const test = this.dbPath;
          } catch (e) {
            throw new FireModelProxyError(e, `The attempt to "remove" the ${capitalize(this.modelName)} with ID of "${this.id}" has been aborted. This is often because you don't have the right properties set for the dynamic path. This model requires the following dynamic properties to uniquely define (and remove) it: ${this.dynamicPathComponents.join(", ")}`);
          }
          for (const rel of this.relationships) {
            const relProperty = this.get(rel.property);
            try {
              if (rel.relType === "hasOne" && relProperty) {
                await this.disassociate(rel.property, this.get(rel.property));
              } else if (rel.relType === "hasMany" && relProperty) {
                for (const relFk of Object.keys(relProperty)) {
                  await this.disassociate(rel.property, relFk);
                }
              }
            } catch (e) {
              throw new FireModelProxyError(e, `While trying to remove ${capitalize(this.modelName)}.${this.id} from the database, problems were encountered removing the relationship defined by the "${rel.property} property (which relates to the model ${rel.fkModelName}). This relationship has a cardinality of "${rel.relType}" and the value(s) were: ${rel.relType === "hasOne" ? Object.keys(this.get(rel.property)) : this.get(rel.property)}`);
            }
          }
          await this.db.remove(this.dbPath);
          break;
        case "add":
          try {
            await this.db.set(path4, this.data);
          } catch (e) {
            throw new FireModelProxyError(e, `Problem setting the "${path4}" database path. Data passed in was of type ${typeof this.data}. Error message encountered was: ${e.message}`, `firemodel/${e.code = "permission-denied"}`);
          }
          break;
        case "update":
          const paths = this._getPaths(this, {changed, added, removed});
          this.db.update("/", paths);
          break;
      }
      this.isDirty = false;
      this._writeAudit(crudAction, this.data, priorValue);
      if (!options.silent && !options.silentAcceptance) {
        if (watchers.length === 0) {
          await this.dispatch(UnwatchedLocalEvent2(this, {
            type: actionTypeEnd,
            ...event,
            transactionId,
            value: withoutMetaOrPrivate(this.data)
          }));
        } else {
          const dispatch = WatchDispatcher2(this.dispatch);
          for (const watcher of watchers) {
            if (!options.silent) {
              await dispatch(watcher)({type: actionTypeEnd, ...event});
            }
          }
        }
      }
      if (this.db.isMockDb && this.db.mock && options.silent) {
        this.db.mock.restoreEvents();
      }
    } catch (e) {
      await this.dispatch(UnwatchedLocalEvent2(this, {
        type: actionTypeFailure,
        ...event,
        transactionId,
        value: withoutMetaOrPrivate(this.data)
      }));
      throw new RecordCrudFailure(this, crudAction, transactionId, e);
    }
  }
  _findDynamicComponents(path4 = "") {
    if (!path4.includes(":")) {
      return [];
    }
    const results = [];
    let remaining = path4;
    let index10 = remaining.indexOf(":");
    while (index10 !== -1) {
      remaining = remaining.slice(index10);
      const prop = remaining.replace(/\:(\w+).*/, "$1");
      results.push(prop);
      remaining = remaining.replace(`:${prop}`, "");
      index10 = remaining.indexOf(":");
    }
    return results;
  }
  _injectDynamicPathProperties(path4, forProp = "dbOffset") {
    this.dynamicPathComponents.forEach((prop) => {
      const value = this.data[prop];
      if (value ? false : true) {
        throw new FireModelError2(`You can not ask for the ${forProp} on a model like "${this.modelName}" which has a dynamic property of "${prop}" before setting that property [ data: ${JSON.stringify(this.data)} ].`, "record/not-ready");
      }
      if (!["string", "number"].includes(typeof value)) {
        throw new FireModelError2(`The path is using the property "${prop}" on ${this.modelName} as a part of the route path but that property must be either a string or a number and instead was a ${typeof prop}`, "record/not-allowed");
      }
      path4 = path4.replace(`:${prop}`, String(this.get(prop)));
    });
    return path4;
  }
  async _getFromDB(id) {
    const keys2 = typeof id === "string" ? createCompositeKeyFromFkString2(id, this.modelConstructor) : id;
    Object.keys(keys2).map((key2) => {
      this._data[key2] = keys2[key2];
    });
    const data = await this.db.getRecord(this.dbPath);
    if (data && data.id) {
      await this._initialize(data);
    } else {
      throw new FireModelError2(`Failed to load the Record "${this.modelName}::${this.id}" with composite key of:
 ${JSON.stringify(keys2, null, 2)}`, "firebase/invalid-composite-key");
    }
    return this;
  }
  async _adding(options) {
    if (!this.id) {
      this.id = key();
    }
    const now = new Date().getTime();
    if (!this.get("createdAt")) {
      this._data.createdAt = now;
    }
    this._data.lastUpdated = now;
    if (!this.db) {
      throw new FireModelError2(`An attempt to add a ${capitalize(this.modelName)} record failed as the Database has not been connected yet. Try setting FireModel's defaultDb first.`, "firemodel/db-not-ready");
    }
    await this._localCrudOperation(IFmCrudOperations.add, void 0, options);
    const relationshipsTouched = this.relationships.reduce((agg, rel) => {
      if (rel.relType === "hasMany" && Object.keys(this.data[rel.property]).length > 0) {
        return agg.concat(rel.property);
      } else if (rel.relType === "hasOne" && this.data[rel.property]) {
        return agg.concat(rel.property);
      } else {
        return agg;
      }
    }, []).filter((prop) => this.META.relationship(prop).inverseProperty);
    const promises = [];
    try {
      for (const prop of relationshipsTouched) {
        const meta2 = this.META.relationship(prop);
        if (meta2.relType === "hasOne") {
          promises.push(this.associate(prop, this.get(prop)));
        }
        if (meta2.relType === "hasMany") {
          Object.keys(this.get(prop)).forEach((fkRef) => promises.push(this.associate(prop, fkRef)));
        }
      }
      await Promise.all(promises);
    } catch (e) {
      throw new FireModelProxyError(e, `An ${capitalize(this.modelName)} [${this.id}] model was being added but when attempting to add in the relationships which were inferred by the record payload it ran into problems. The relationship(s) which had properties defined -- and which had a bi-lateral FK relationship (e.g., both models will track the relationship versus just the ${capitalize(this.modelName)} [${this.id} model) --  were: ${relationshipsTouched.join(", ")}`);
    }
    return this;
  }
}

// src/Mock/NamedFakes.ts
const NamedFakes = {
  id: true,
  fbKey: true,
  String: true,
  number: true,
  Number: true,
  price: true,
  Boolean: true,
  Object: true,
  name: true,
  firstName: true,
  lastName: true,
  company: true,
  companyName: true,
  address: true,
  streetAddress: true,
  fullAddress: true,
  city: true,
  state: true,
  zipCode: true,
  stateAbbr: true,
  country: true,
  countryCode: true,
  latitude: true,
  longitude: true,
  coordinate: true,
  gender: true,
  age: true,
  ageChild: true,
  ageAdult: true,
  ageOlder: true,
  jobTitle: true,
  date: true,
  dateRecent: true,
  dateRecentString: true,
  dateMiliseconds: true,
  dateRecentMiliseconds: true,
  datePast: true,
  datePastString: true,
  datePastMiliseconds: true,
  dateFuture: true,
  dateFutureString: true,
  dateFutureMiliseconds: true,
  dateSoon: true,
  dateSoonString: true,
  dateSoonMiliseconds: true,
  imageAvatar: true,
  imageAnimal: true,
  imageNature: true,
  imagePeople: true,
  imageTransport: true,
  phoneNumber: true,
  email: true,
  word: true,
  words: true,
  sentence: true,
  paragraph: true,
  paragraphs: true,
  slug: true,
  url: true,
  uuid: true,
  random: true,
  sequence: true,
  distribution: true,
  placeImage: true,
  placeHolder: true
};

// src/Mock/PropertyNamePatterns.ts
const PropertyNamePatterns = {
  id: "id",
  name: "name",
  age: "age",
  fullname: "name",
  firstName: "firstName",
  lastName: "lastName",
  address: "address",
  city: "city",
  state: "stateAbbr",
  country: "countryCode",
  street: "streetAddress",
  streetAddress: "streetAddress",
  lat: "latitude",
  latitude: "latitude",
  lon: "longitude",
  longitude: "longitude",
  avatar: "imageAvatar",
  phone: "phoneNumber",
  phoneNumber: "phoneNumber"
};

// src/Mock/processHasMany.ts
async function processHasMany2(record, rel, config, db) {
  const fkMockMeta = (await Mock(rel.fkConstructor(), db).generate(1)).pop();
  const prop = rel.property;
  await record.addToRelationship(prop, fkMockMeta.compositeKey);
  if (config.relationshipBehavior === "link") {
    await db.remove(fkMockMeta.dbPath);
    return;
  }
  return fkMockMeta;
}

// src/Mock/processHasOne.ts
async function processHasOne2(source, rel, config, db) {
  const fkMock = Mock(rel.fkConstructor(), db);
  const fkMockMeta = (await fkMock.generate(1)).pop();
  const prop = rel.property;
  source.setRelationship(prop, fkMockMeta.compositeKey);
  if (config.relationshipBehavior === "link") {
    const predecessors = fkMockMeta.dbPath.replace(fkMockMeta.id, "").split("/").filter((i) => i);
    await db.remove(fkMockMeta.dbPath);
  }
  return fkMockMeta;
}

// src/Mock/addRelationships.ts
function addRelationships(db, config, exceptions2 = {}) {
  return async (record) => {
    const relns = record.META.relationships;
    const relnResults = [];
    if (config.relationshipBehavior !== "ignore") {
      for (const rel of relns) {
        if (!config.cardinality || Object.keys(config.cardinality).includes(rel.property)) {
          if (rel.relType === "hasOne") {
            const fkRec = await processHasOne2(record, rel, config, db);
            if (config.relationshipBehavior === "follow") {
              relnResults.push(fkRec);
            }
          } else {
            const cardinality = config.cardinality ? typeof config.cardinality[rel.property] === "number" ? config.cardinality[rel.property] : NumberBetween(config.cardinality[rel.property]) : 2;
            for (const i of Array(cardinality)) {
              const fkRec = await processHasMany2(record, rel, config, db);
              if (config.relationshipBehavior === "follow") {
                relnResults.push(fkRec);
              }
            }
          }
        }
      }
    }
    return [
      {
        id: record.id,
        compositeKey: record.compositeKey,
        modelName: record.modelName,
        pluralName: record.pluralName,
        dbPath: record.dbPath,
        localPath: record.localPath
      },
      ...relnResults
    ];
  };
}
function NumberBetween(startEnd) {
  return Math.floor(Math.random() * (startEnd[1] - startEnd[0] + 1)) + startEnd[0];
}

// node_modules/date-fns/esm/_lib/toInteger/index.js
function toInteger2(dirtyNumber) {
  if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
    return NaN;
  }
  var number = Number(dirtyNumber);
  if (isNaN(number)) {
    return number;
  }
  return number < 0 ? Math.ceil(number) : Math.floor(number);
}

// node_modules/date-fns/esm/_lib/requiredArgs/index.js
function requiredArgs2(required, args) {
  if (args.length < required) {
    throw new TypeError(required + " argument" + (required > 1 ? "s" : "") + " required, but only " + args.length + " present");
  }
}

// node_modules/date-fns/esm/toDate/index.js
function toDate2(argument) {
  requiredArgs2(1, arguments);
  var argStr = Object.prototype.toString.call(argument);
  if (argument instanceof Date || typeof argument === "object" && argStr === "[object Date]") {
    return new Date(argument.getTime());
  } else if (typeof argument === "number" || argStr === "[object Number]") {
    return new Date(argument);
  } else {
    if ((typeof argument === "string" || argStr === "[object String]") && typeof console !== "undefined") {
      console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as arguments. Please use `parseISO` to parse strings. See: https://git.io/fjule");
      console.warn(new Error().stack);
    }
    return new Date(NaN);
  }
}

// node_modules/date-fns/esm/addMilliseconds/index.js
function addMilliseconds2(dirtyDate, dirtyAmount) {
  requiredArgs2(2, arguments);
  var timestamp = toDate2(dirtyDate).getTime();
  var amount = toInteger2(dirtyAmount);
  return new Date(timestamp + amount);
}

// node_modules/date-fns/esm/_lib/getTimezoneOffsetInMilliseconds/index.js
var MILLISECONDS_IN_MINUTE = 6e4;
function getDateMillisecondsPart(date2) {
  return date2.getTime() % MILLISECONDS_IN_MINUTE;
}
function getTimezoneOffsetInMilliseconds(dirtyDate) {
  var date2 = new Date(dirtyDate.getTime());
  var baseTimezoneOffset = Math.ceil(date2.getTimezoneOffset());
  date2.setSeconds(0, 0);
  var hasNegativeUTCOffset = baseTimezoneOffset > 0;
  var millisecondsPartOfTimezoneOffset = hasNegativeUTCOffset ? (MILLISECONDS_IN_MINUTE + getDateMillisecondsPart(date2)) % MILLISECONDS_IN_MINUTE : getDateMillisecondsPart(date2);
  return baseTimezoneOffset * MILLISECONDS_IN_MINUTE + millisecondsPartOfTimezoneOffset;
}

// node_modules/date-fns/esm/isValid/index.js
function isValid2(dirtyDate) {
  requiredArgs2(1, arguments);
  var date2 = toDate2(dirtyDate);
  return !isNaN(date2);
}

// node_modules/date-fns/esm/locale/en-US/_lib/formatDistance/index.js
var formatDistanceLocale = {
  lessThanXSeconds: {
    one: "less than a second",
    other: "less than {{count}} seconds"
  },
  xSeconds: {
    one: "1 second",
    other: "{{count}} seconds"
  },
  halfAMinute: "half a minute",
  lessThanXMinutes: {
    one: "less than a minute",
    other: "less than {{count}} minutes"
  },
  xMinutes: {
    one: "1 minute",
    other: "{{count}} minutes"
  },
  aboutXHours: {
    one: "about 1 hour",
    other: "about {{count}} hours"
  },
  xHours: {
    one: "1 hour",
    other: "{{count}} hours"
  },
  xDays: {
    one: "1 day",
    other: "{{count}} days"
  },
  aboutXWeeks: {
    one: "about 1 week",
    other: "about {{count}} weeks"
  },
  xWeeks: {
    one: "1 week",
    other: "{{count}} weeks"
  },
  aboutXMonths: {
    one: "about 1 month",
    other: "about {{count}} months"
  },
  xMonths: {
    one: "1 month",
    other: "{{count}} months"
  },
  aboutXYears: {
    one: "about 1 year",
    other: "about {{count}} years"
  },
  xYears: {
    one: "1 year",
    other: "{{count}} years"
  },
  overXYears: {
    one: "over 1 year",
    other: "over {{count}} years"
  },
  almostXYears: {
    one: "almost 1 year",
    other: "almost {{count}} years"
  }
};
function formatDistance4(token, count, options) {
  options = options || {};
  var result;
  if (typeof formatDistanceLocale[token] === "string") {
    result = formatDistanceLocale[token];
  } else if (count === 1) {
    result = formatDistanceLocale[token].one;
  } else {
    result = formatDistanceLocale[token].other.replace("{{count}}", count);
  }
  if (options.addSuffix) {
    if (options.comparison > 0) {
      return "in " + result;
    } else {
      return result + " ago";
    }
  }
  return result;
}

// node_modules/date-fns/esm/locale/_lib/buildFormatLongFn/index.js
function buildFormatLongFn(args) {
  return function(dirtyOptions) {
    var options = dirtyOptions || {};
    var width = options.width ? String(options.width) : args.defaultWidth;
    var format4 = args.formats[width] || args.formats[args.defaultWidth];
    return format4;
  };
}

// node_modules/date-fns/esm/locale/en-US/_lib/formatLong/index.js
var dateFormats = {
  full: "EEEE, MMMM do, y",
  long: "MMMM do, y",
  medium: "MMM d, y",
  short: "MM/dd/yyyy"
};
var timeFormats = {
  full: "h:mm:ss a zzzz",
  long: "h:mm:ss a z",
  medium: "h:mm:ss a",
  short: "h:mm a"
};
var dateTimeFormats = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}"
};
var formatLong = {
  date: buildFormatLongFn({
    formats: dateFormats,
    defaultWidth: "full"
  }),
  time: buildFormatLongFn({
    formats: timeFormats,
    defaultWidth: "full"
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats,
    defaultWidth: "full"
  })
};
const formatLong_default = formatLong;

// node_modules/date-fns/esm/locale/en-US/_lib/formatRelative/index.js
var formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P"
};
function formatRelative3(token, _date, _baseDate, _options) {
  return formatRelativeLocale[token];
}

// node_modules/date-fns/esm/locale/_lib/buildLocalizeFn/index.js
function buildLocalizeFn(args) {
  return function(dirtyIndex, dirtyOptions) {
    var options = dirtyOptions || {};
    var context = options.context ? String(options.context) : "standalone";
    var valuesArray;
    if (context === "formatting" && args.formattingValues) {
      var defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      var width = options.width ? String(options.width) : defaultWidth;
      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      var _defaultWidth = args.defaultWidth;
      var _width = options.width ? String(options.width) : args.defaultWidth;
      valuesArray = args.values[_width] || args.values[_defaultWidth];
    }
    var index10 = args.argumentCallback ? args.argumentCallback(dirtyIndex) : dirtyIndex;
    return valuesArray[index10];
  };
}

// node_modules/date-fns/esm/locale/en-US/_lib/localize/index.js
var eraValues = {
  narrow: ["B", "A"],
  abbreviated: ["BC", "AD"],
  wide: ["Before Christ", "Anno Domini"]
};
var quarterValues = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["Q1", "Q2", "Q3", "Q4"],
  wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
};
var monthValues = {
  narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  abbreviated: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  wide: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};
var dayValues = {
  narrow: ["S", "M", "T", "W", "T", "F", "S"],
  short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  wide: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
};
var dayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  }
};
var formattingDayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  }
};
function ordinalNumber(dirtyNumber, _dirtyOptions) {
  var number = Number(dirtyNumber);
  var rem100 = number % 100;
  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
    }
  }
  return number + "th";
}
var localize = {
  ordinalNumber,
  era: buildLocalizeFn({
    values: eraValues,
    defaultWidth: "wide"
  }),
  quarter: buildLocalizeFn({
    values: quarterValues,
    defaultWidth: "wide",
    argumentCallback: function(quarter) {
      return Number(quarter) - 1;
    }
  }),
  month: buildLocalizeFn({
    values: monthValues,
    defaultWidth: "wide"
  }),
  day: buildLocalizeFn({
    values: dayValues,
    defaultWidth: "wide"
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: "wide"
  })
};
const localize_default = localize;

// node_modules/date-fns/esm/locale/_lib/buildMatchPatternFn/index.js
function buildMatchPatternFn(args) {
  return function(dirtyString, dirtyOptions) {
    var string = String(dirtyString);
    var options = dirtyOptions || {};
    var matchResult = string.match(args.matchPattern);
    if (!matchResult) {
      return null;
    }
    var matchedString = matchResult[0];
    var parseResult = string.match(args.parsePattern);
    if (!parseResult) {
      return null;
    }
    var value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
    value = options.valueCallback ? options.valueCallback(value) : value;
    return {
      value,
      rest: string.slice(matchedString.length)
    };
  };
}

// node_modules/date-fns/esm/locale/_lib/buildMatchFn/index.js
function buildMatchFn(args) {
  return function(dirtyString, dirtyOptions) {
    var string = String(dirtyString);
    var options = dirtyOptions || {};
    var width = options.width;
    var matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
    var matchResult = string.match(matchPattern);
    if (!matchResult) {
      return null;
    }
    var matchedString = matchResult[0];
    var parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
    var value;
    if (Object.prototype.toString.call(parsePatterns) === "[object Array]") {
      value = findIndex(parsePatterns, function(pattern) {
        return pattern.test(matchedString);
      });
    } else {
      value = findKey(parsePatterns, function(pattern) {
        return pattern.test(matchedString);
      });
    }
    value = args.valueCallback ? args.valueCallback(value) : value;
    value = options.valueCallback ? options.valueCallback(value) : value;
    return {
      value,
      rest: string.slice(matchedString.length)
    };
  };
}
function findKey(object, predicate) {
  for (var key2 in object) {
    if (object.hasOwnProperty(key2) && predicate(object[key2])) {
      return key2;
    }
  }
}
function findIndex(array, predicate) {
  for (var key2 = 0; key2 < array.length; key2++) {
    if (predicate(array[key2])) {
      return key2;
    }
  }
}

// node_modules/date-fns/esm/locale/en-US/_lib/match/index.js
var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
var parseOrdinalNumberPattern = /\d+/i;
var matchEraPatterns = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
};
var parseEraPatterns = {
  any: [/^b/i, /^(a|c)/i]
};
var matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
};
var parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i]
};
var matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
};
var parseMonthPatterns = {
  narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
  any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
};
var matchDayPatterns = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
};
var parseDayPatterns = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
};
var matchDayPeriodPatterns = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
};
var parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i
  }
};
var match = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: function(value) {
      return parseInt(value, 10);
    }
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns,
    defaultParseWidth: "any"
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: "any",
    valueCallback: function(index10) {
      return index10 + 1;
    }
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: "any"
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns,
    defaultParseWidth: "any"
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: "any"
  })
};
const match_default = match;

// node_modules/date-fns/esm/locale/en-US/index.js
var locale = {
  code: "en-US",
  formatDistance: formatDistance4,
  formatLong: formatLong_default,
  formatRelative: formatRelative3,
  localize: localize_default,
  match: match_default,
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1
  }
};
const en_US_default = locale;

// node_modules/date-fns/esm/subMilliseconds/index.js
function subMilliseconds2(dirtyDate, dirtyAmount) {
  requiredArgs2(2, arguments);
  var amount = toInteger2(dirtyAmount);
  return addMilliseconds2(dirtyDate, -amount);
}

// node_modules/date-fns/esm/_lib/addLeadingZeros/index.js
function addLeadingZeros(number, targetLength) {
  var sign = number < 0 ? "-" : "";
  var output = Math.abs(number).toString();
  while (output.length < targetLength) {
    output = "0" + output;
  }
  return sign + output;
}

// node_modules/date-fns/esm/_lib/format/lightFormatters/index.js
var formatters2 = {
  y: function(date2, token) {
    var signedYear = date2.getUTCFullYear();
    var year = signedYear > 0 ? signedYear : 1 - signedYear;
    return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
  },
  M: function(date2, token) {
    var month = date2.getUTCMonth();
    return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
  },
  d: function(date2, token) {
    return addLeadingZeros(date2.getUTCDate(), token.length);
  },
  a: function(date2, token) {
    var dayPeriodEnumValue = date2.getUTCHours() / 12 >= 1 ? "pm" : "am";
    switch (token) {
      case "a":
      case "aa":
      case "aaa":
        return dayPeriodEnumValue.toUpperCase();
      case "aaaaa":
        return dayPeriodEnumValue[0];
      case "aaaa":
      default:
        return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
    }
  },
  h: function(date2, token) {
    return addLeadingZeros(date2.getUTCHours() % 12 || 12, token.length);
  },
  H: function(date2, token) {
    return addLeadingZeros(date2.getUTCHours(), token.length);
  },
  m: function(date2, token) {
    return addLeadingZeros(date2.getUTCMinutes(), token.length);
  },
  s: function(date2, token) {
    return addLeadingZeros(date2.getUTCSeconds(), token.length);
  },
  S: function(date2, token) {
    var numberOfDigits = token.length;
    var milliseconds2 = date2.getUTCMilliseconds();
    var fractionalSeconds = Math.floor(milliseconds2 * Math.pow(10, numberOfDigits - 3));
    return addLeadingZeros(fractionalSeconds, token.length);
  }
};
const lightFormatters_default = formatters2;

// node_modules/date-fns/esm/_lib/getUTCDayOfYear/index.js
var MILLISECONDS_IN_DAY = 864e5;
function getUTCDayOfYear2(dirtyDate) {
  requiredArgs2(1, arguments);
  var date2 = toDate2(dirtyDate);
  var timestamp = date2.getTime();
  date2.setUTCMonth(0, 1);
  date2.setUTCHours(0, 0, 0, 0);
  var startOfYearTimestamp = date2.getTime();
  var difference = timestamp - startOfYearTimestamp;
  return Math.floor(difference / MILLISECONDS_IN_DAY) + 1;
}

// node_modules/date-fns/esm/_lib/startOfUTCISOWeek/index.js
function startOfUTCISOWeek2(dirtyDate) {
  requiredArgs2(1, arguments);
  var weekStartsOn = 1;
  var date2 = toDate2(dirtyDate);
  var day = date2.getUTCDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date2.setUTCDate(date2.getUTCDate() - diff);
  date2.setUTCHours(0, 0, 0, 0);
  return date2;
}

// node_modules/date-fns/esm/_lib/getUTCISOWeekYear/index.js
function getUTCISOWeekYear2(dirtyDate) {
  requiredArgs2(1, arguments);
  var date2 = toDate2(dirtyDate);
  var year = date2.getUTCFullYear();
  var fourthOfJanuaryOfNextYear = new Date(0);
  fourthOfJanuaryOfNextYear.setUTCFullYear(year + 1, 0, 4);
  fourthOfJanuaryOfNextYear.setUTCHours(0, 0, 0, 0);
  var startOfNextYear = startOfUTCISOWeek2(fourthOfJanuaryOfNextYear);
  var fourthOfJanuaryOfThisYear = new Date(0);
  fourthOfJanuaryOfThisYear.setUTCFullYear(year, 0, 4);
  fourthOfJanuaryOfThisYear.setUTCHours(0, 0, 0, 0);
  var startOfThisYear = startOfUTCISOWeek2(fourthOfJanuaryOfThisYear);
  if (date2.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (date2.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

// node_modules/date-fns/esm/_lib/startOfUTCISOWeekYear/index.js
function startOfUTCISOWeekYear2(dirtyDate) {
  requiredArgs2(1, arguments);
  var year = getUTCISOWeekYear2(dirtyDate);
  var fourthOfJanuary = new Date(0);
  fourthOfJanuary.setUTCFullYear(year, 0, 4);
  fourthOfJanuary.setUTCHours(0, 0, 0, 0);
  var date2 = startOfUTCISOWeek2(fourthOfJanuary);
  return date2;
}

// node_modules/date-fns/esm/_lib/getUTCISOWeek/index.js
var MILLISECONDS_IN_WEEK = 6048e5;
function getUTCISOWeek2(dirtyDate) {
  requiredArgs2(1, arguments);
  var date2 = toDate2(dirtyDate);
  var diff = startOfUTCISOWeek2(date2).getTime() - startOfUTCISOWeekYear2(date2).getTime();
  return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
}

// node_modules/date-fns/esm/_lib/startOfUTCWeek/index.js
function startOfUTCWeek2(dirtyDate, dirtyOptions) {
  requiredArgs2(1, arguments);
  var options = dirtyOptions || {};
  var locale2 = options.locale;
  var localeWeekStartsOn = locale2 && locale2.options && locale2.options.weekStartsOn;
  var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger2(localeWeekStartsOn);
  var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger2(options.weekStartsOn);
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");
  }
  var date2 = toDate2(dirtyDate);
  var day = date2.getUTCDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date2.setUTCDate(date2.getUTCDate() - diff);
  date2.setUTCHours(0, 0, 0, 0);
  return date2;
}

// node_modules/date-fns/esm/_lib/getUTCWeekYear/index.js
function getUTCWeekYear2(dirtyDate, dirtyOptions) {
  requiredArgs2(1, arguments);
  var date2 = toDate2(dirtyDate, dirtyOptions);
  var year = date2.getUTCFullYear();
  var options = dirtyOptions || {};
  var locale2 = options.locale;
  var localeFirstWeekContainsDate = locale2 && locale2.options && locale2.options.firstWeekContainsDate;
  var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger2(localeFirstWeekContainsDate);
  var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger2(options.firstWeekContainsDate);
  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
    throw new RangeError("firstWeekContainsDate must be between 1 and 7 inclusively");
  }
  var firstWeekOfNextYear = new Date(0);
  firstWeekOfNextYear.setUTCFullYear(year + 1, 0, firstWeekContainsDate);
  firstWeekOfNextYear.setUTCHours(0, 0, 0, 0);
  var startOfNextYear = startOfUTCWeek2(firstWeekOfNextYear, dirtyOptions);
  var firstWeekOfThisYear = new Date(0);
  firstWeekOfThisYear.setUTCFullYear(year, 0, firstWeekContainsDate);
  firstWeekOfThisYear.setUTCHours(0, 0, 0, 0);
  var startOfThisYear = startOfUTCWeek2(firstWeekOfThisYear, dirtyOptions);
  if (date2.getTime() >= startOfNextYear.getTime()) {
    return year + 1;
  } else if (date2.getTime() >= startOfThisYear.getTime()) {
    return year;
  } else {
    return year - 1;
  }
}

// node_modules/date-fns/esm/_lib/startOfUTCWeekYear/index.js
function startOfUTCWeekYear2(dirtyDate, dirtyOptions) {
  requiredArgs2(1, arguments);
  var options = dirtyOptions || {};
  var locale2 = options.locale;
  var localeFirstWeekContainsDate = locale2 && locale2.options && locale2.options.firstWeekContainsDate;
  var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger2(localeFirstWeekContainsDate);
  var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger2(options.firstWeekContainsDate);
  var year = getUTCWeekYear2(dirtyDate, dirtyOptions);
  var firstWeek = new Date(0);
  firstWeek.setUTCFullYear(year, 0, firstWeekContainsDate);
  firstWeek.setUTCHours(0, 0, 0, 0);
  var date2 = startOfUTCWeek2(firstWeek, dirtyOptions);
  return date2;
}

// node_modules/date-fns/esm/_lib/getUTCWeek/index.js
var MILLISECONDS_IN_WEEK2 = 6048e5;
function getUTCWeek2(dirtyDate, options) {
  requiredArgs2(1, arguments);
  var date2 = toDate2(dirtyDate);
  var diff = startOfUTCWeek2(date2, options).getTime() - startOfUTCWeekYear2(date2, options).getTime();
  return Math.round(diff / MILLISECONDS_IN_WEEK2) + 1;
}

// node_modules/date-fns/esm/_lib/format/formatters/index.js
var dayPeriodEnum = {
  am: "am",
  pm: "pm",
  midnight: "midnight",
  noon: "noon",
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  night: "night"
};
var formatters = {
  G: function(date2, token, localize3) {
    var era = date2.getUTCFullYear() > 0 ? 1 : 0;
    switch (token) {
      case "G":
      case "GG":
      case "GGG":
        return localize3.era(era, {
          width: "abbreviated"
        });
      case "GGGGG":
        return localize3.era(era, {
          width: "narrow"
        });
      case "GGGG":
      default:
        return localize3.era(era, {
          width: "wide"
        });
    }
  },
  y: function(date2, token, localize3) {
    if (token === "yo") {
      var signedYear = date2.getUTCFullYear();
      var year = signedYear > 0 ? signedYear : 1 - signedYear;
      return localize3.ordinalNumber(year, {
        unit: "year"
      });
    }
    return lightFormatters_default.y(date2, token);
  },
  Y: function(date2, token, localize3, options) {
    var signedWeekYear = getUTCWeekYear2(date2, options);
    var weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;
    if (token === "YY") {
      var twoDigitYear = weekYear % 100;
      return addLeadingZeros(twoDigitYear, 2);
    }
    if (token === "Yo") {
      return localize3.ordinalNumber(weekYear, {
        unit: "year"
      });
    }
    return addLeadingZeros(weekYear, token.length);
  },
  R: function(date2, token) {
    var isoWeekYear = getUTCISOWeekYear2(date2);
    return addLeadingZeros(isoWeekYear, token.length);
  },
  u: function(date2, token) {
    var year = date2.getUTCFullYear();
    return addLeadingZeros(year, token.length);
  },
  Q: function(date2, token, localize3) {
    var quarter = Math.ceil((date2.getUTCMonth() + 1) / 3);
    switch (token) {
      case "Q":
        return String(quarter);
      case "QQ":
        return addLeadingZeros(quarter, 2);
      case "Qo":
        return localize3.ordinalNumber(quarter, {
          unit: "quarter"
        });
      case "QQQ":
        return localize3.quarter(quarter, {
          width: "abbreviated",
          context: "formatting"
        });
      case "QQQQQ":
        return localize3.quarter(quarter, {
          width: "narrow",
          context: "formatting"
        });
      case "QQQQ":
      default:
        return localize3.quarter(quarter, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  q: function(date2, token, localize3) {
    var quarter = Math.ceil((date2.getUTCMonth() + 1) / 3);
    switch (token) {
      case "q":
        return String(quarter);
      case "qq":
        return addLeadingZeros(quarter, 2);
      case "qo":
        return localize3.ordinalNumber(quarter, {
          unit: "quarter"
        });
      case "qqq":
        return localize3.quarter(quarter, {
          width: "abbreviated",
          context: "standalone"
        });
      case "qqqqq":
        return localize3.quarter(quarter, {
          width: "narrow",
          context: "standalone"
        });
      case "qqqq":
      default:
        return localize3.quarter(quarter, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  M: function(date2, token, localize3) {
    var month = date2.getUTCMonth();
    switch (token) {
      case "M":
      case "MM":
        return lightFormatters_default.M(date2, token);
      case "Mo":
        return localize3.ordinalNumber(month + 1, {
          unit: "month"
        });
      case "MMM":
        return localize3.month(month, {
          width: "abbreviated",
          context: "formatting"
        });
      case "MMMMM":
        return localize3.month(month, {
          width: "narrow",
          context: "formatting"
        });
      case "MMMM":
      default:
        return localize3.month(month, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  L: function(date2, token, localize3) {
    var month = date2.getUTCMonth();
    switch (token) {
      case "L":
        return String(month + 1);
      case "LL":
        return addLeadingZeros(month + 1, 2);
      case "Lo":
        return localize3.ordinalNumber(month + 1, {
          unit: "month"
        });
      case "LLL":
        return localize3.month(month, {
          width: "abbreviated",
          context: "standalone"
        });
      case "LLLLL":
        return localize3.month(month, {
          width: "narrow",
          context: "standalone"
        });
      case "LLLL":
      default:
        return localize3.month(month, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  w: function(date2, token, localize3, options) {
    var week = getUTCWeek2(date2, options);
    if (token === "wo") {
      return localize3.ordinalNumber(week, {
        unit: "week"
      });
    }
    return addLeadingZeros(week, token.length);
  },
  I: function(date2, token, localize3) {
    var isoWeek = getUTCISOWeek2(date2);
    if (token === "Io") {
      return localize3.ordinalNumber(isoWeek, {
        unit: "week"
      });
    }
    return addLeadingZeros(isoWeek, token.length);
  },
  d: function(date2, token, localize3) {
    if (token === "do") {
      return localize3.ordinalNumber(date2.getUTCDate(), {
        unit: "date"
      });
    }
    return lightFormatters_default.d(date2, token);
  },
  D: function(date2, token, localize3) {
    var dayOfYear = getUTCDayOfYear2(date2);
    if (token === "Do") {
      return localize3.ordinalNumber(dayOfYear, {
        unit: "dayOfYear"
      });
    }
    return addLeadingZeros(dayOfYear, token.length);
  },
  E: function(date2, token, localize3) {
    var dayOfWeek = date2.getUTCDay();
    switch (token) {
      case "E":
      case "EE":
      case "EEE":
        return localize3.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      case "EEEEE":
        return localize3.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      case "EEEEEE":
        return localize3.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      case "EEEE":
      default:
        return localize3.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  e: function(date2, token, localize3, options) {
    var dayOfWeek = date2.getUTCDay();
    var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      case "e":
        return String(localDayOfWeek);
      case "ee":
        return addLeadingZeros(localDayOfWeek, 2);
      case "eo":
        return localize3.ordinalNumber(localDayOfWeek, {
          unit: "day"
        });
      case "eee":
        return localize3.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      case "eeeee":
        return localize3.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      case "eeeeee":
        return localize3.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      case "eeee":
      default:
        return localize3.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  c: function(date2, token, localize3, options) {
    var dayOfWeek = date2.getUTCDay();
    var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
    switch (token) {
      case "c":
        return String(localDayOfWeek);
      case "cc":
        return addLeadingZeros(localDayOfWeek, token.length);
      case "co":
        return localize3.ordinalNumber(localDayOfWeek, {
          unit: "day"
        });
      case "ccc":
        return localize3.day(dayOfWeek, {
          width: "abbreviated",
          context: "standalone"
        });
      case "ccccc":
        return localize3.day(dayOfWeek, {
          width: "narrow",
          context: "standalone"
        });
      case "cccccc":
        return localize3.day(dayOfWeek, {
          width: "short",
          context: "standalone"
        });
      case "cccc":
      default:
        return localize3.day(dayOfWeek, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  i: function(date2, token, localize3) {
    var dayOfWeek = date2.getUTCDay();
    var isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    switch (token) {
      case "i":
        return String(isoDayOfWeek);
      case "ii":
        return addLeadingZeros(isoDayOfWeek, token.length);
      case "io":
        return localize3.ordinalNumber(isoDayOfWeek, {
          unit: "day"
        });
      case "iii":
        return localize3.day(dayOfWeek, {
          width: "abbreviated",
          context: "formatting"
        });
      case "iiiii":
        return localize3.day(dayOfWeek, {
          width: "narrow",
          context: "formatting"
        });
      case "iiiiii":
        return localize3.day(dayOfWeek, {
          width: "short",
          context: "formatting"
        });
      case "iiii":
      default:
        return localize3.day(dayOfWeek, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  a: function(date2, token, localize3) {
    var hours = date2.getUTCHours();
    var dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    switch (token) {
      case "a":
      case "aa":
      case "aaa":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "aaaaa":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "aaaa":
      default:
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  b: function(date2, token, localize3) {
    var hours = date2.getUTCHours();
    var dayPeriodEnumValue;
    if (hours === 12) {
      dayPeriodEnumValue = dayPeriodEnum.noon;
    } else if (hours === 0) {
      dayPeriodEnumValue = dayPeriodEnum.midnight;
    } else {
      dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
    }
    switch (token) {
      case "b":
      case "bb":
      case "bbb":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "bbbbb":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "bbbb":
      default:
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  B: function(date2, token, localize3) {
    var hours = date2.getUTCHours();
    var dayPeriodEnumValue;
    if (hours >= 17) {
      dayPeriodEnumValue = dayPeriodEnum.evening;
    } else if (hours >= 12) {
      dayPeriodEnumValue = dayPeriodEnum.afternoon;
    } else if (hours >= 4) {
      dayPeriodEnumValue = dayPeriodEnum.morning;
    } else {
      dayPeriodEnumValue = dayPeriodEnum.night;
    }
    switch (token) {
      case "B":
      case "BB":
      case "BBB":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "abbreviated",
          context: "formatting"
        });
      case "BBBBB":
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "narrow",
          context: "formatting"
        });
      case "BBBB":
      default:
        return localize3.dayPeriod(dayPeriodEnumValue, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  h: function(date2, token, localize3) {
    if (token === "ho") {
      var hours = date2.getUTCHours() % 12;
      if (hours === 0)
        hours = 12;
      return localize3.ordinalNumber(hours, {
        unit: "hour"
      });
    }
    return lightFormatters_default.h(date2, token);
  },
  H: function(date2, token, localize3) {
    if (token === "Ho") {
      return localize3.ordinalNumber(date2.getUTCHours(), {
        unit: "hour"
      });
    }
    return lightFormatters_default.H(date2, token);
  },
  K: function(date2, token, localize3) {
    var hours = date2.getUTCHours() % 12;
    if (token === "Ko") {
      return localize3.ordinalNumber(hours, {
        unit: "hour"
      });
    }
    return addLeadingZeros(hours, token.length);
  },
  k: function(date2, token, localize3) {
    var hours = date2.getUTCHours();
    if (hours === 0)
      hours = 24;
    if (token === "ko") {
      return localize3.ordinalNumber(hours, {
        unit: "hour"
      });
    }
    return addLeadingZeros(hours, token.length);
  },
  m: function(date2, token, localize3) {
    if (token === "mo") {
      return localize3.ordinalNumber(date2.getUTCMinutes(), {
        unit: "minute"
      });
    }
    return lightFormatters_default.m(date2, token);
  },
  s: function(date2, token, localize3) {
    if (token === "so") {
      return localize3.ordinalNumber(date2.getUTCSeconds(), {
        unit: "second"
      });
    }
    return lightFormatters_default.s(date2, token);
  },
  S: function(date2, token) {
    return lightFormatters_default.S(date2, token);
  },
  X: function(date2, token, _localize, options) {
    var originalDate = options._originalDate || date2;
    var timezoneOffset = originalDate.getTimezoneOffset();
    if (timezoneOffset === 0) {
      return "Z";
    }
    switch (token) {
      case "X":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      case "XXXX":
      case "XX":
        return formatTimezone(timezoneOffset);
      case "XXXXX":
      case "XXX":
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },
  x: function(date2, token, _localize, options) {
    var originalDate = options._originalDate || date2;
    var timezoneOffset = originalDate.getTimezoneOffset();
    switch (token) {
      case "x":
        return formatTimezoneWithOptionalMinutes(timezoneOffset);
      case "xxxx":
      case "xx":
        return formatTimezone(timezoneOffset);
      case "xxxxx":
      case "xxx":
      default:
        return formatTimezone(timezoneOffset, ":");
    }
  },
  O: function(date2, token, _localize, options) {
    var originalDate = options._originalDate || date2;
    var timezoneOffset = originalDate.getTimezoneOffset();
    switch (token) {
      case "O":
      case "OO":
      case "OOO":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      case "OOOO":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },
  z: function(date2, token, _localize, options) {
    var originalDate = options._originalDate || date2;
    var timezoneOffset = originalDate.getTimezoneOffset();
    switch (token) {
      case "z":
      case "zz":
      case "zzz":
        return "GMT" + formatTimezoneShort(timezoneOffset, ":");
      case "zzzz":
      default:
        return "GMT" + formatTimezone(timezoneOffset, ":");
    }
  },
  t: function(date2, token, _localize, options) {
    var originalDate = options._originalDate || date2;
    var timestamp = Math.floor(originalDate.getTime() / 1e3);
    return addLeadingZeros(timestamp, token.length);
  },
  T: function(date2, token, _localize, options) {
    var originalDate = options._originalDate || date2;
    var timestamp = originalDate.getTime();
    return addLeadingZeros(timestamp, token.length);
  }
};
function formatTimezoneShort(offset, dirtyDelimiter) {
  var sign = offset > 0 ? "-" : "+";
  var absOffset = Math.abs(offset);
  var hours = Math.floor(absOffset / 60);
  var minutes = absOffset % 60;
  if (minutes === 0) {
    return sign + String(hours);
  }
  var delimiter = dirtyDelimiter || "";
  return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
}
function formatTimezoneWithOptionalMinutes(offset, dirtyDelimiter) {
  if (offset % 60 === 0) {
    var sign = offset > 0 ? "-" : "+";
    return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
  }
  return formatTimezone(offset, dirtyDelimiter);
}
function formatTimezone(offset, dirtyDelimiter) {
  var delimiter = dirtyDelimiter || "";
  var sign = offset > 0 ? "-" : "+";
  var absOffset = Math.abs(offset);
  var hours = addLeadingZeros(Math.floor(absOffset / 60), 2);
  var minutes = addLeadingZeros(absOffset % 60, 2);
  return sign + hours + delimiter + minutes;
}
const formatters_default = formatters;

// node_modules/date-fns/esm/_lib/format/longFormatters/index.js
function dateLongFormatter(pattern, formatLong3) {
  switch (pattern) {
    case "P":
      return formatLong3.date({
        width: "short"
      });
    case "PP":
      return formatLong3.date({
        width: "medium"
      });
    case "PPP":
      return formatLong3.date({
        width: "long"
      });
    case "PPPP":
    default:
      return formatLong3.date({
        width: "full"
      });
  }
}
function timeLongFormatter(pattern, formatLong3) {
  switch (pattern) {
    case "p":
      return formatLong3.time({
        width: "short"
      });
    case "pp":
      return formatLong3.time({
        width: "medium"
      });
    case "ppp":
      return formatLong3.time({
        width: "long"
      });
    case "pppp":
    default:
      return formatLong3.time({
        width: "full"
      });
  }
}
function dateTimeLongFormatter(pattern, formatLong3) {
  var matchResult = pattern.match(/(P+)(p+)?/);
  var datePattern = matchResult[1];
  var timePattern = matchResult[2];
  if (!timePattern) {
    return dateLongFormatter(pattern, formatLong3);
  }
  var dateTimeFormat;
  switch (datePattern) {
    case "P":
      dateTimeFormat = formatLong3.dateTime({
        width: "short"
      });
      break;
    case "PP":
      dateTimeFormat = formatLong3.dateTime({
        width: "medium"
      });
      break;
    case "PPP":
      dateTimeFormat = formatLong3.dateTime({
        width: "long"
      });
      break;
    case "PPPP":
    default:
      dateTimeFormat = formatLong3.dateTime({
        width: "full"
      });
      break;
  }
  return dateTimeFormat.replace("{{date}}", dateLongFormatter(datePattern, formatLong3)).replace("{{time}}", timeLongFormatter(timePattern, formatLong3));
}
var longFormatters = {
  p: timeLongFormatter,
  P: dateTimeLongFormatter
};
const longFormatters_default = longFormatters;

// node_modules/date-fns/esm/_lib/protectedTokens/index.js
var protectedDayOfYearTokens = ["D", "DD"];
var protectedWeekYearTokens = ["YY", "YYYY"];
function isProtectedDayOfYearToken(token) {
  return protectedDayOfYearTokens.indexOf(token) !== -1;
}
function isProtectedWeekYearToken(token) {
  return protectedWeekYearTokens.indexOf(token) !== -1;
}
function throwProtectedError(token) {
  if (token === "YYYY") {
    throw new RangeError("Use `yyyy` instead of `YYYY` for formatting years; see: https://git.io/fxCyr");
  } else if (token === "YY") {
    throw new RangeError("Use `yy` instead of `YY` for formatting years; see: https://git.io/fxCyr");
  } else if (token === "D") {
    throw new RangeError("Use `d` instead of `D` for formatting days of the month; see: https://git.io/fxCyr");
  } else if (token === "DD") {
    throw new RangeError("Use `dd` instead of `DD` for formatting days of the month; see: https://git.io/fxCyr");
  }
}

// node_modules/date-fns/esm/format/index.js
var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
var escapedStringRegExp = /^'([^]*?)'?$/;
var doubleQuoteRegExp = /''/g;
var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
function format(dirtyDate, dirtyFormatStr, dirtyOptions) {
  requiredArgs2(2, arguments);
  var formatStr = String(dirtyFormatStr);
  var options = dirtyOptions || {};
  var locale2 = options.locale || en_US_default;
  var localeFirstWeekContainsDate = locale2.options && locale2.options.firstWeekContainsDate;
  var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger2(localeFirstWeekContainsDate);
  var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger2(options.firstWeekContainsDate);
  if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
    throw new RangeError("firstWeekContainsDate must be between 1 and 7 inclusively");
  }
  var localeWeekStartsOn = locale2.options && locale2.options.weekStartsOn;
  var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger2(localeWeekStartsOn);
  var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger2(options.weekStartsOn);
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");
  }
  if (!locale2.localize) {
    throw new RangeError("locale must contain localize property");
  }
  if (!locale2.formatLong) {
    throw new RangeError("locale must contain formatLong property");
  }
  var originalDate = toDate2(dirtyDate);
  if (!isValid2(originalDate)) {
    throw new RangeError("Invalid time value");
  }
  var timezoneOffset = getTimezoneOffsetInMilliseconds(originalDate);
  var utcDate = subMilliseconds2(originalDate, timezoneOffset);
  var formatterOptions = {
    firstWeekContainsDate,
    weekStartsOn,
    locale: locale2,
    _originalDate: originalDate
  };
  var result = formatStr.match(longFormattingTokensRegExp).map(function(substring) {
    var firstCharacter = substring[0];
    if (firstCharacter === "p" || firstCharacter === "P") {
      var longFormatter = longFormatters_default[firstCharacter];
      return longFormatter(substring, locale2.formatLong, formatterOptions);
    }
    return substring;
  }).join("").match(formattingTokensRegExp).map(function(substring) {
    if (substring === "''") {
      return "'";
    }
    var firstCharacter = substring[0];
    if (firstCharacter === "'") {
      return cleanEscapedString(substring);
    }
    var formatter = formatters_default[firstCharacter];
    if (formatter) {
      if (!options.useAdditionalWeekYearTokens && isProtectedWeekYearToken(substring)) {
        throwProtectedError(substring);
      }
      if (!options.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(substring)) {
        throwProtectedError(substring);
      }
      return formatter(utcDate, substring, locale2.localize, formatterOptions);
    }
    if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
      throw new RangeError("Format string contains an unescaped latin alphabet character `" + firstCharacter + "`");
    }
    return substring;
  }).join("");
  return result;
}
function cleanEscapedString(input) {
  return input.match(escapedStringRegExp)[1].replace(doubleQuoteRegExp, "'");
}

// src/Mock/fakeIt.ts
const sequence = {};
function getDistribution(...distribution) {
  const num = Math.floor(Math.random() * 100) + 1;
  let start = 1;
  let outcome;
  const d = distribution.map((i) => {
    const [percentage, value] = i;
    const end = start + percentage - 1;
    const val = {start, end, value};
    start = start + percentage;
    return val;
  });
  d.forEach((i) => {
    if (num >= i.start && num <= i.end) {
      outcome = i.value;
    }
  });
  if (!outcome) {
    throw new Error(`The mock distribution's random number [ ${num} ] fell outside the range of probability; make sure that your percentages add up to 100 [ ${distribution.map((i) => i[0]).join(", ")} ]`);
  }
  return outcome;
}
function fakeIt(helper, type, ...rest) {
  function getNumber(numOptions) {
    return numOptions && typeof numOptions === "object" ? helper.faker.random.number(numOptions) : helper.faker.random.number({min: 1, max: 100});
  }
  function options(defaultValue2 = {}) {
    return rest[0] ? {...defaultValue2, ...rest[0]} : void 0;
  }
  switch (type) {
    case "id":
    case "fbKey":
      return key();
    case "String":
      return helper.faker.lorem.words(5);
    case "number":
    case "Number":
      return getNumber(options({min: 0, max: 1e3}));
    case "price":
      const price = options({
        symbol: "$",
        min: 1,
        max: 100,
        precision: 2,
        variableCents: false
      });
      let cents;
      if (price.variableCents) {
        cents = getDistribution([40, "00"], [30, "99"], [30, String(getNumber({min: 1, max: 98}))]);
        if (cents.length === 1) {
          cents = cents + "0";
        }
      }
      const priceAmt = helper.faker.commerce.price(price.min, price.max, price.precision, price.symbol);
      return price.variableCents ? priceAmt.replace(".00", "." + cents) : priceAmt;
    case "Boolean":
      return Math.random() > 0.49 ? true : false;
    case "Object":
      return {};
    case "name":
      return helper.faker.name.firstName() + " " + helper.faker.name.lastName();
    case "firstName":
      return helper.faker.name.firstName();
    case "lastName":
      return helper.faker.name.lastName();
    case "company":
    case "companyName":
      return helper.faker.company.companyName();
    case "address":
      return helper.faker.address.secondaryAddress() + ", " + helper.faker.address.city() + ", " + helper.faker.address.stateAbbr() + "  " + helper.faker.address.zipCode();
    case "streetAddress":
      return helper.faker.address.streetAddress(false);
    case "fullAddress":
      return helper.faker.address.streetAddress(true);
    case "city":
      return helper.faker.address.city();
    case "state":
      return helper.faker.address.state();
    case "zipCode":
      return helper.faker.address.zipCode();
    case "stateAbbr":
      return helper.faker.address.stateAbbr();
    case "country":
      return helper.faker.address.country();
    case "countryCode":
      return helper.faker.address.countryCode();
    case "latitude":
      return helper.faker.address.latitude();
    case "longitude":
      return helper.faker.address.longitude();
    case "coordinate":
      return {
        latitude: Number(helper.faker.address.latitude()),
        longitude: Number(helper.faker.address.longitude())
      };
    case "gender":
      return helper.faker.helpers.shuffle([
        "male",
        "female",
        "male",
        "female",
        "male",
        "female",
        "other"
      ]);
    case "age":
      return helper.faker.random.number({min: 1, max: 99});
    case "ageChild":
      return helper.faker.random.number({min: 1, max: 10});
    case "ageAdult":
      return helper.faker.random.number({min: 21, max: 99});
    case "ageOlder":
      return helper.faker.random.number({min: 60, max: 99});
    case "jobTitle":
      return helper.faker.name.jobTitle;
    case "date":
    case "dateRecent":
      return helper.faker.date.recent();
    case "dateRecentString":
      return format(helper.faker.date.recent(), "yyyy-MM-dd");
    case "dateMiliseconds":
    case "dateRecentMiliseconds":
      return helper.faker.date.recent().getTime();
    case "datePast":
      return helper.faker.date.past();
    case "datePastString":
      return format(helper.faker.date.past(), "yyyy-MM-dd");
    case "datePastMiliseconds":
      return helper.faker.date.past().getTime();
    case "dateFuture":
      return helper.faker.date.future();
    case "dateFutureString":
      return format(helper.faker.date.future(), "yyyy-MM-dd");
    case "dateFutureMiliseconds":
      return helper.faker.date.future().getTime();
    case "dateSoon":
      return helper.faker.date.between(new Date(), new Date(new Date().getTime() + 5 * 24 * 60 * 1e3));
    case "dateSoonString":
      return format(helper.faker.date.between(new Date(), new Date(new Date().getTime() + 5 * 24 * 60 * 1e3)), "yyyy-MM-dd");
    case "dateSoonMiliseconds":
      return helper.faker.date.between(new Date(), new Date(new Date().getTime() + 5 * 24 * 60 * 1e3)).getTime();
    case "imageAvatar":
      return helper.faker.image.avatar();
    case "imageAnimal":
      return helper.faker.image.animals();
    case "imagePeople":
      return helper.faker.image.people();
    case "imageNature":
      return helper.faker.image.nature();
    case "imageTransport":
      return helper.faker.image.transport();
    case "phoneNumber":
      return helper.faker.phone.phoneNumber();
    case "email":
      return helper.faker.internet.email;
    case "word":
      return helper.faker.lorem.word();
    case "words":
      return helper.faker.lorem.words();
    case "sentence":
      return helper.faker.lorem.sentence();
    case "slug":
      return helper.faker.lorem.slug();
    case "paragraph":
      return helper.faker.lorem.paragraph();
    case "paragraphs":
      return helper.faker.lorem.paragraphs();
    case "url":
      return helper.faker.internet.url();
    case "uuid":
      return helper.faker.random.uuid();
    case "random":
      return helper.faker.random.arrayElement(rest);
    case "distribution":
      return getDistribution(...rest);
    case "sequence":
      const prop = helper.context.property;
      const items = rest;
      if (typeof sequence[prop] === "undefined") {
        sequence[prop] = 0;
      } else {
        if (sequence[prop] >= items.length - 1) {
          sequence[prop] = 0;
        } else {
          sequence[prop]++;
        }
      }
      return items[sequence[prop]];
    case "placeImage":
      const [width, height, imgType] = rest;
      return `https://placeimg.com/${width}/${height}/${imgType ? imgType : "all"}`;
    case "placeHolder":
      const [size, backgroundColor, textColor] = rest;
      let url = `https://via.placeholder.com/${size}`;
      if (backgroundColor) {
        url += `/${backgroundColor}`;
        if (textColor) {
          url += `/${textColor}`;
        }
      }
      return url;
    default:
      return helper.faker.lorem.slug();
  }
}

// src/Mock/mockProperties.ts
import {getMockHelper} from "firemock";
function mockProperties(db, config = {relationshipBehavior: "ignore"}, exceptions2) {
  return async (record) => {
    const meta2 = getModelMeta(record);
    const props2 = meta2.properties;
    const recProps = {};
    const mh = await getMockHelper(db);
    for (const prop of props2) {
      const p = prop.property;
      recProps[p] = await mockValue(db, prop, mh);
    }
    const finalized = {...recProps, ...exceptions2};
    record = await Record2.add(record.modelConstructor, finalized, {
      silent: true
    });
    return record;
  };
}

// src/Mock/mockValue.ts
function mockValue(db, propMeta, mockHelper, ...rest) {
  mockHelper.context = propMeta;
  const {type, mockType, mockParameters} = propMeta;
  if (mockType) {
    return typeof mockType === "function" ? mockType(mockHelper) : fakeIt(mockHelper, mockType, ...mockParameters || []);
  } else {
    const fakedMockType = Object.keys(NamedFakes).includes(propMeta.property) ? PropertyNamePatterns[propMeta.property] : type;
    return fakeIt(mockHelper, fakedMockType, ...mockParameters || []);
  }
}

// src/Mock/types.ts

// src/Mock/index.ts

// src/Mock/api.ts
import {Mock as Mock2} from "firemock";
let mockPrepared = false;
function API(db, modelConstructor) {
  const config = {
    relationshipBehavior: "ignore",
    exceptionPassthrough: false
  };
  const MockApi = {
    async generate(count, exceptions2 = {}) {
      if (!mockPrepared) {
        await Mock2.prepare();
        mockPrepared = true;
      }
      const props2 = mockProperties(db, config, exceptions2);
      const relns = addRelationships(db, config, exceptions2);
      const record = Record2.createWith(modelConstructor, exceptions2, {db: this.db});
      if (record.hasDynamicPath) {
        const notCovered = record.dynamicPathComponents.filter((key2) => !Object.keys(exceptions2).includes(key2));
        const validMocks = ["sequence", "random", "distribution"];
        notCovered.forEach((key2) => {
          const prop = record.META.property(key2) || {};
          const mock3 = prop.mockType;
          if (!mock3 || typeof mock3 !== "function" && !validMocks.includes(mock3)) {
            throw new FireModelError2(`The mock for the "${record.modelName}" model has dynamic segments and "${key2}" was neither set as a fixed value in the exception parameter [ ${Object.keys(exceptions2 || {})} ] of generate() nor was the model constrained by a @mock type ${mock3 ? `[ ${mock3} ]` : ""} which is deemed valid. Valid named mocks are ${JSON.stringify(validMocks)}; all bespoke mocks are accepted as valid.`, `firemodel/mock-not-ready`);
          }
        });
      }
      let mocks = [];
      for (const i of Array(count)) {
        mocks = mocks.concat(await relns(await props2(record)));
      }
      return mocks;
    },
    createRelationshipLinks(cardinality) {
      config.relationshipBehavior = "link";
      return MockApi;
    },
    dynamicPathBehavior(options) {
      return MockApi;
    },
    overridesPassThrough() {
      config.exceptionPassthrough = true;
      return MockApi;
    },
    followRelationshipLinks(cardinality) {
      config.relationshipBehavior = "follow";
      if (cardinality) {
        config.cardinality = cardinality;
      }
      return MockApi;
    }
  };
  return MockApi;
}

// src/Mock.ts
function Mock(modelConstructor, db) {
  if (!db) {
    if (FireModel2.defaultDb) {
      db = FireModel2.defaultDb;
    } else {
      throw new FireModelError2(`You must either explicitly add a database on call to Mock() or ensure that the default database for Firemodel is set!`, "mock/no-database");
    }
  }
  if (!db.isMockDb) {
    console.warn("You are using Mock() with a real database; typically a mock database is preferred");
  }
  return API(db, modelConstructor);
}

// src/watchers/types.ts

// src/@types/audit-types.ts

// src/@types/firemodel-types.ts

// src/@types/general.ts
var RelationshipPolicy;
(function(RelationshipPolicy2) {
  RelationshipPolicy2["keys"] = "keys";
  RelationshipPolicy2["lazy"] = "lazy";
  RelationshipPolicy2["inline"] = "inline";
})(RelationshipPolicy || (RelationshipPolicy = {}));
var RelationshipCardinality;
(function(RelationshipCardinality2) {
  RelationshipCardinality2["hasMany"] = "hasMany";
  RelationshipCardinality2["belongsTo"] = "belongsTo";
})(RelationshipCardinality || (RelationshipCardinality = {}));

// src/@types/record-types.ts

// src/@types/relationships.ts

// src/@types/optional/dexie.ts

// src/@types/index.ts

// src/record/createCompositeKey.ts
function createCompositeKey(rec) {
  const model3 = rec.data;
  if (!rec.id) {
    throw new FireModelError2(`You can not create a composite key without first setting the 'id' property!`, "firemodel/not-ready");
  }
  const dynamicPathComponents = rec.dynamicPathComponents.reduce((prev, key2) => {
    if (!model3[key2]) {
      throw new FireModelError2(`You can not create a composite key on a ${capitalize(rec.modelName)} without first setting the '${key2}' property!`, "firemodel/not-ready");
    }
    return {
      ...prev,
      ...{[key2]: model3[key2]}
    };
  }, {});
  return rec.dynamicPathComponents.reduce((prev, key2) => ({
    ...prev,
    ...dynamicPathComponents
  }), {id: rec.id});
}

// node_modules/dexie/dist/dexie.mjs
var __assign = function() {
  __assign = Object.assign || function __assign3(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++)
    s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
    for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
      r[k] = a[j];
  return r;
}
var keys = Object.keys;
var isArray = Array.isArray;
var _global = typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
if (typeof Promise !== "undefined" && !_global.Promise) {
  _global.Promise = Promise;
}
function extend(obj, extension) {
  if (typeof extension !== "object")
    return obj;
  keys(extension).forEach(function(key2) {
    obj[key2] = extension[key2];
  });
  return obj;
}
var getProto = Object.getPrototypeOf;
var _hasOwn = {}.hasOwnProperty;
function hasOwn(obj, prop) {
  return _hasOwn.call(obj, prop);
}
function props(proto, extension) {
  if (typeof extension === "function")
    extension = extension(getProto(proto));
  keys(extension).forEach(function(key2) {
    setProp(proto, key2, extension[key2]);
  });
}
var defineProperty = Object.defineProperty;
function setProp(obj, prop, functionOrGetSet, options) {
  defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === "function" ? {get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true} : {value: functionOrGetSet, configurable: true, writable: true}, options));
}
function derive(Child) {
  return {
    from: function(Parent) {
      Child.prototype = Object.create(Parent.prototype);
      setProp(Child.prototype, "constructor", Child);
      return {
        extend: props.bind(null, Child.prototype)
      };
    }
  };
}
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
function getPropertyDescriptor(obj, prop) {
  var pd = getOwnPropertyDescriptor(obj, prop);
  var proto;
  return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
}
var _slice = [].slice;
function slice(args, start, end) {
  return _slice.call(args, start, end);
}
function override(origFunc, overridedFactory) {
  return overridedFactory(origFunc);
}
function assert(b) {
  if (!b)
    throw new Error("Assertion Failed");
}
function asap(fn) {
  if (_global.setImmediate)
    setImmediate(fn);
  else
    setTimeout(fn, 0);
}
function arrayToObject(array, extractor) {
  return array.reduce(function(result, item, i) {
    var nameAndValue = extractor(item, i);
    if (nameAndValue)
      result[nameAndValue[0]] = nameAndValue[1];
    return result;
  }, {});
}
function tryCatch(fn, onerror, args) {
  try {
    fn.apply(null, args);
  } catch (ex) {
    onerror && onerror(ex);
  }
}
function getByKeyPath(obj, keyPath) {
  if (hasOwn(obj, keyPath))
    return obj[keyPath];
  if (!keyPath)
    return obj;
  if (typeof keyPath !== "string") {
    var rv = [];
    for (var i = 0, l = keyPath.length; i < l; ++i) {
      var val = getByKeyPath(obj, keyPath[i]);
      rv.push(val);
    }
    return rv;
  }
  var period = keyPath.indexOf(".");
  if (period !== -1) {
    var innerObj = obj[keyPath.substr(0, period)];
    return innerObj === void 0 ? void 0 : getByKeyPath(innerObj, keyPath.substr(period + 1));
  }
  return void 0;
}
function setByKeyPath(obj, keyPath, value) {
  if (!obj || keyPath === void 0)
    return;
  if ("isFrozen" in Object && Object.isFrozen(obj))
    return;
  if (typeof keyPath !== "string" && "length" in keyPath) {
    assert(typeof value !== "string" && "length" in value);
    for (var i = 0, l = keyPath.length; i < l; ++i) {
      setByKeyPath(obj, keyPath[i], value[i]);
    }
  } else {
    var period = keyPath.indexOf(".");
    if (period !== -1) {
      var currentKeyPath = keyPath.substr(0, period);
      var remainingKeyPath = keyPath.substr(period + 1);
      if (remainingKeyPath === "")
        if (value === void 0) {
          if (isArray(obj) && !isNaN(parseInt(currentKeyPath)))
            obj.splice(currentKeyPath, 1);
          else
            delete obj[currentKeyPath];
        } else
          obj[currentKeyPath] = value;
      else {
        var innerObj = obj[currentKeyPath];
        if (!innerObj)
          innerObj = obj[currentKeyPath] = {};
        setByKeyPath(innerObj, remainingKeyPath, value);
      }
    } else {
      if (value === void 0) {
        if (isArray(obj) && !isNaN(parseInt(keyPath)))
          obj.splice(keyPath, 1);
        else
          delete obj[keyPath];
      } else
        obj[keyPath] = value;
    }
  }
}
function delByKeyPath(obj, keyPath) {
  if (typeof keyPath === "string")
    setByKeyPath(obj, keyPath, void 0);
  else if ("length" in keyPath)
    [].map.call(keyPath, function(kp) {
      setByKeyPath(obj, kp, void 0);
    });
}
function shallowClone(obj) {
  var rv = {};
  for (var m in obj) {
    if (hasOwn(obj, m))
      rv[m] = obj[m];
  }
  return rv;
}
var concat = [].concat;
function flatten(a) {
  return concat.apply([], a);
}
var intrinsicTypeNames = "Boolean,String,Date,RegExp,Blob,File,FileList,ArrayBuffer,DataView,Uint8ClampedArray,ImageData,Map,Set".split(",").concat(flatten([8, 16, 32, 64].map(function(num) {
  return ["Int", "Uint", "Float"].map(function(t) {
    return t + num + "Array";
  });
}))).filter(function(t) {
  return _global[t];
});
var intrinsicTypes = intrinsicTypeNames.map(function(t) {
  return _global[t];
});
var intrinsicTypeNameSet = arrayToObject(intrinsicTypeNames, function(x) {
  return [x, true];
});
function deepClone(any) {
  if (!any || typeof any !== "object")
    return any;
  var rv;
  if (isArray(any)) {
    rv = [];
    for (var i = 0, l = any.length; i < l; ++i) {
      rv.push(deepClone(any[i]));
    }
  } else if (intrinsicTypes.indexOf(any.constructor) >= 0) {
    rv = any;
  } else {
    rv = any.constructor ? Object.create(any.constructor.prototype) : {};
    for (var prop in any) {
      if (hasOwn(any, prop)) {
        rv[prop] = deepClone(any[prop]);
      }
    }
  }
  return rv;
}
var toString = {}.toString;
function toStringTag(o) {
  return toString.call(o).slice(8, -1);
}
var getValueOf = function(val, type) {
  return type === "Array" ? "" + val.map(function(v) {
    return getValueOf(v, toStringTag(v));
  }) : type === "ArrayBuffer" ? "" + new Uint8Array(val) : type === "Date" ? val.getTime() : ArrayBuffer.isView(val) ? "" + new Uint8Array(val.buffer) : val;
};
function getObjectDiff(a, b, rv, prfx) {
  rv = rv || {};
  prfx = prfx || "";
  keys(a).forEach(function(prop) {
    if (!hasOwn(b, prop))
      rv[prfx + prop] = void 0;
    else {
      var ap = a[prop], bp = b[prop];
      if (typeof ap === "object" && typeof bp === "object" && ap && bp) {
        var apTypeName = toStringTag(ap);
        var bpTypeName = toStringTag(bp);
        if (apTypeName === bpTypeName) {
          if (intrinsicTypeNameSet[apTypeName]) {
            if (getValueOf(ap, apTypeName) !== getValueOf(bp, bpTypeName)) {
              rv[prfx + prop] = b[prop];
            }
          } else {
            getObjectDiff(ap, bp, rv, prfx + prop + ".");
          }
        } else {
          rv[prfx + prop] = b[prop];
        }
      } else if (ap !== bp)
        rv[prfx + prop] = b[prop];
    }
  });
  keys(b).forEach(function(prop) {
    if (!hasOwn(a, prop)) {
      rv[prfx + prop] = b[prop];
    }
  });
  return rv;
}
var iteratorSymbol = typeof Symbol !== "undefined" && Symbol.iterator;
var getIteratorOf = iteratorSymbol ? function(x) {
  var i;
  return x != null && (i = x[iteratorSymbol]) && i.apply(x);
} : function() {
  return null;
};
var NO_CHAR_ARRAY = {};
function getArrayOf(arrayLike) {
  var i, a, x, it;
  if (arguments.length === 1) {
    if (isArray(arrayLike))
      return arrayLike.slice();
    if (this === NO_CHAR_ARRAY && typeof arrayLike === "string")
      return [arrayLike];
    if (it = getIteratorOf(arrayLike)) {
      a = [];
      while (x = it.next(), !x.done)
        a.push(x.value);
      return a;
    }
    if (arrayLike == null)
      return [arrayLike];
    i = arrayLike.length;
    if (typeof i === "number") {
      a = new Array(i);
      while (i--)
        a[i] = arrayLike[i];
      return a;
    }
    return [arrayLike];
  }
  i = arguments.length;
  a = new Array(i);
  while (i--)
    a[i] = arguments[i];
  return a;
}
var isAsyncFunction = typeof Symbol !== "undefined" ? function(fn) {
  return fn[Symbol.toStringTag] === "AsyncFunction";
} : function() {
  return false;
};
var debug = typeof location !== "undefined" && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
function setDebug(value, filter) {
  debug = value;
  libraryFilter = filter;
}
var libraryFilter = function() {
  return true;
};
var NEEDS_THROW_FOR_STACK = !new Error("").stack;
function getErrorWithStack() {
  if (NEEDS_THROW_FOR_STACK)
    try {
      throw new Error();
    } catch (e) {
      return e;
    }
  return new Error();
}
function prettyStack(exception, numIgnoredFrames) {
  var stack = exception.stack;
  if (!stack)
    return "";
  numIgnoredFrames = numIgnoredFrames || 0;
  if (stack.indexOf(exception.name) === 0)
    numIgnoredFrames += (exception.name + exception.message).split("\n").length;
  return stack.split("\n").slice(numIgnoredFrames).filter(libraryFilter).map(function(frame) {
    return "\n" + frame;
  }).join("");
}
var dexieErrorNames = [
  "Modify",
  "Bulk",
  "OpenFailed",
  "VersionChange",
  "Schema",
  "Upgrade",
  "InvalidTable",
  "MissingAPI",
  "NoSuchDatabase",
  "InvalidArgument",
  "SubTransaction",
  "Unsupported",
  "Internal",
  "DatabaseClosed",
  "PrematureCommit",
  "ForeignAwait"
];
var idbDomErrorNames = [
  "Unknown",
  "Constraint",
  "Data",
  "TransactionInactive",
  "ReadOnly",
  "Version",
  "NotFound",
  "InvalidState",
  "InvalidAccess",
  "Abort",
  "Timeout",
  "QuotaExceeded",
  "Syntax",
  "DataClone"
];
var errorList = dexieErrorNames.concat(idbDomErrorNames);
var defaultTexts = {
  VersionChanged: "Database version changed by other database connection",
  DatabaseClosed: "Database has been closed",
  Abort: "Transaction aborted",
  TransactionInactive: "Transaction has already completed or failed"
};
function DexieError(name, msg) {
  this._e = getErrorWithStack();
  this.name = name;
  this.message = msg;
}
derive(DexieError).from(Error).extend({
  stack: {
    get: function() {
      return this._stack || (this._stack = this.name + ": " + this.message + prettyStack(this._e, 2));
    }
  },
  toString: function() {
    return this.name + ": " + this.message;
  }
});
function getMultiErrorMessage(msg, failures) {
  return msg + ". Errors: " + Object.keys(failures).map(function(key2) {
    return failures[key2].toString();
  }).filter(function(v, i, s) {
    return s.indexOf(v) === i;
  }).join("\n");
}
function ModifyError(msg, failures, successCount, failedKeys) {
  this._e = getErrorWithStack();
  this.failures = failures;
  this.failedKeys = failedKeys;
  this.successCount = successCount;
  this.message = getMultiErrorMessage(msg, failures);
}
derive(ModifyError).from(DexieError);
function BulkError(msg, failures) {
  this._e = getErrorWithStack();
  this.name = "BulkError";
  this.failures = failures;
  this.message = getMultiErrorMessage(msg, failures);
}
derive(BulkError).from(DexieError);
var errnames = errorList.reduce(function(obj, name) {
  return obj[name] = name + "Error", obj;
}, {});
var BaseException = DexieError;
var exceptions = errorList.reduce(function(obj, name) {
  var fullName = name + "Error";
  function DexieError3(msgOrInner, inner) {
    this._e = getErrorWithStack();
    this.name = fullName;
    if (!msgOrInner) {
      this.message = defaultTexts[name] || fullName;
      this.inner = null;
    } else if (typeof msgOrInner === "string") {
      this.message = "" + msgOrInner + (!inner ? "" : "\n " + inner);
      this.inner = inner || null;
    } else if (typeof msgOrInner === "object") {
      this.message = msgOrInner.name + " " + msgOrInner.message;
      this.inner = msgOrInner;
    }
  }
  derive(DexieError3).from(BaseException);
  obj[name] = DexieError3;
  return obj;
}, {});
exceptions.Syntax = SyntaxError;
exceptions.Type = TypeError;
exceptions.Range = RangeError;
var exceptionMap = idbDomErrorNames.reduce(function(obj, name) {
  obj[name + "Error"] = exceptions[name];
  return obj;
}, {});
function mapError(domError, message) {
  if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name])
    return domError;
  var rv = new exceptionMap[domError.name](message || domError.message, domError);
  if ("stack" in domError) {
    setProp(rv, "stack", {get: function() {
      return this.inner.stack;
    }});
  }
  return rv;
}
var fullNameExceptions = errorList.reduce(function(obj, name) {
  if (["Syntax", "Type", "Range"].indexOf(name) === -1)
    obj[name + "Error"] = exceptions[name];
  return obj;
}, {});
fullNameExceptions.ModifyError = ModifyError;
fullNameExceptions.DexieError = DexieError;
fullNameExceptions.BulkError = BulkError;
function nop() {
}
function mirror(val) {
  return val;
}
function pureFunctionChain(f1, f2) {
  if (f1 == null || f1 === mirror)
    return f2;
  return function(val) {
    return f2(f1(val));
  };
}
function callBoth(on1, on2) {
  return function() {
    on1.apply(this, arguments);
    on2.apply(this, arguments);
  };
}
function hookCreatingChain(f1, f2) {
  if (f1 === nop)
    return f2;
  return function() {
    var res = f1.apply(this, arguments);
    if (res !== void 0)
      arguments[0] = res;
    var onsuccess = this.onsuccess, onerror = this.onerror;
    this.onsuccess = null;
    this.onerror = null;
    var res2 = f2.apply(this, arguments);
    if (onsuccess)
      this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
    if (onerror)
      this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
    return res2 !== void 0 ? res2 : res;
  };
}
function hookDeletingChain(f1, f2) {
  if (f1 === nop)
    return f2;
  return function() {
    f1.apply(this, arguments);
    var onsuccess = this.onsuccess, onerror = this.onerror;
    this.onsuccess = this.onerror = null;
    f2.apply(this, arguments);
    if (onsuccess)
      this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
    if (onerror)
      this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
  };
}
function hookUpdatingChain(f1, f2) {
  if (f1 === nop)
    return f2;
  return function(modifications) {
    var res = f1.apply(this, arguments);
    extend(modifications, res);
    var onsuccess = this.onsuccess, onerror = this.onerror;
    this.onsuccess = null;
    this.onerror = null;
    var res2 = f2.apply(this, arguments);
    if (onsuccess)
      this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
    if (onerror)
      this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
    return res === void 0 ? res2 === void 0 ? void 0 : res2 : extend(res, res2);
  };
}
function reverseStoppableEventChain(f1, f2) {
  if (f1 === nop)
    return f2;
  return function() {
    if (f2.apply(this, arguments) === false)
      return false;
    return f1.apply(this, arguments);
  };
}
function promisableChain(f1, f2) {
  if (f1 === nop)
    return f2;
  return function() {
    var res = f1.apply(this, arguments);
    if (res && typeof res.then === "function") {
      var thiz = this, i = arguments.length, args = new Array(i);
      while (i--)
        args[i] = arguments[i];
      return res.then(function() {
        return f2.apply(thiz, args);
      });
    }
    return f2.apply(this, arguments);
  };
}
var INTERNAL = {};
var LONG_STACKS_CLIP_LIMIT = 100;
var MAX_LONG_STACKS = 20;
var ZONE_ECHO_LIMIT = 100;
var _a = typeof Promise === "undefined" ? [] : function() {
  var globalP = Promise.resolve();
  if (typeof crypto === "undefined" || !crypto.subtle)
    return [globalP, globalP.__proto__, globalP];
  var nativeP = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
  return [
    nativeP,
    nativeP.__proto__,
    globalP
  ];
}();
var resolvedNativePromise = _a[0];
var nativePromiseProto = _a[1];
var resolvedGlobalPromise = _a[2];
var nativePromiseThen = nativePromiseProto && nativePromiseProto.then;
var NativePromise = resolvedNativePromise && resolvedNativePromise.constructor;
var patchGlobalPromise = !!resolvedGlobalPromise;
var stack_being_generated = false;
var schedulePhysicalTick = resolvedGlobalPromise ? function() {
  resolvedGlobalPromise.then(physicalTick);
} : _global.setImmediate ? setImmediate.bind(null, physicalTick) : _global.MutationObserver ? function() {
  var hiddenDiv = document.createElement("div");
  new MutationObserver(function() {
    physicalTick();
    hiddenDiv = null;
  }).observe(hiddenDiv, {attributes: true});
  hiddenDiv.setAttribute("i", "1");
} : function() {
  setTimeout(physicalTick, 0);
};
var asap$1 = function(callback, args) {
  microtickQueue.push([callback, args]);
  if (needsNewPhysicalTick) {
    schedulePhysicalTick();
    needsNewPhysicalTick = false;
  }
};
var isOutsideMicroTick = true;
var needsNewPhysicalTick = true;
var unhandledErrors = [];
var rejectingErrors = [];
var currentFulfiller = null;
var rejectionMapper = mirror;
var globalPSD = {
  id: "global",
  global: true,
  ref: 0,
  unhandleds: [],
  onunhandled: globalError,
  pgp: false,
  env: {},
  finalize: function() {
    this.unhandleds.forEach(function(uh) {
      try {
        globalError(uh[0], uh[1]);
      } catch (e) {
      }
    });
  }
};
var PSD = globalPSD;
var microtickQueue = [];
var numScheduledCalls = 0;
var tickFinalizers = [];
function DexiePromise(fn) {
  if (typeof this !== "object")
    throw new TypeError("Promises must be constructed via new");
  this._listeners = [];
  this.onuncatched = nop;
  this._lib = false;
  var psd = this._PSD = PSD;
  if (debug) {
    this._stackHolder = getErrorWithStack();
    this._prev = null;
    this._numPrev = 0;
  }
  if (typeof fn !== "function") {
    if (fn !== INTERNAL)
      throw new TypeError("Not a function");
    this._state = arguments[1];
    this._value = arguments[2];
    if (this._state === false)
      handleRejection(this, this._value);
    return;
  }
  this._state = null;
  this._value = null;
  ++psd.ref;
  executePromiseTask(this, fn);
}
var thenProp = {
  get: function() {
    var psd = PSD, microTaskId = totalEchoes;
    function then(onFulfilled, onRejected) {
      var _this = this;
      var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
      if (possibleAwait)
        decrementExpectedAwaits();
      var rv = new DexiePromise(function(resolve, reject) {
        propagateToListener(_this, new Listener(nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait), nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait), resolve, reject, psd));
      });
      debug && linkToPreviousPromise(rv, this);
      return rv;
    }
    then.prototype = INTERNAL;
    return then;
  },
  set: function(value) {
    setProp(this, "then", value && value.prototype === INTERNAL ? thenProp : {
      get: function() {
        return value;
      },
      set: thenProp.set
    });
  }
};
props(DexiePromise.prototype, {
  then: thenProp,
  _then: function(onFulfilled, onRejected) {
    propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));
  },
  catch: function(onRejected) {
    if (arguments.length === 1)
      return this.then(null, onRejected);
    var type = arguments[0], handler = arguments[1];
    return typeof type === "function" ? this.then(null, function(err) {
      return err instanceof type ? handler(err) : PromiseReject(err);
    }) : this.then(null, function(err) {
      return err && err.name === type ? handler(err) : PromiseReject(err);
    });
  },
  finally: function(onFinally) {
    return this.then(function(value) {
      onFinally();
      return value;
    }, function(err) {
      onFinally();
      return PromiseReject(err);
    });
  },
  stack: {
    get: function() {
      if (this._stack)
        return this._stack;
      try {
        stack_being_generated = true;
        var stacks = getStack(this, [], MAX_LONG_STACKS);
        var stack = stacks.join("\nFrom previous: ");
        if (this._state !== null)
          this._stack = stack;
        return stack;
      } finally {
        stack_being_generated = false;
      }
    }
  },
  timeout: function(ms, msg) {
    var _this = this;
    return ms < Infinity ? new DexiePromise(function(resolve, reject) {
      var handle = setTimeout(function() {
        return reject(new exceptions.Timeout(msg));
      }, ms);
      _this.then(resolve, reject).finally(clearTimeout.bind(null, handle));
    }) : this;
  }
});
if (typeof Symbol !== "undefined" && Symbol.toStringTag)
  setProp(DexiePromise.prototype, Symbol.toStringTag, "Dexie.Promise");
globalPSD.env = snapShot();
function Listener(onFulfilled, onRejected, resolve, reject, zone) {
  this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
  this.onRejected = typeof onRejected === "function" ? onRejected : null;
  this.resolve = resolve;
  this.reject = reject;
  this.psd = zone;
}
props(DexiePromise, {
  all: function() {
    var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
    return new DexiePromise(function(resolve, reject) {
      if (values.length === 0)
        resolve([]);
      var remaining = values.length;
      values.forEach(function(a, i) {
        return DexiePromise.resolve(a).then(function(x) {
          values[i] = x;
          if (!--remaining)
            resolve(values);
        }, reject);
      });
    });
  },
  resolve: function(value) {
    if (value instanceof DexiePromise)
      return value;
    if (value && typeof value.then === "function")
      return new DexiePromise(function(resolve, reject) {
        value.then(resolve, reject);
      });
    var rv = new DexiePromise(INTERNAL, true, value);
    linkToPreviousPromise(rv, currentFulfiller);
    return rv;
  },
  reject: PromiseReject,
  race: function() {
    var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
    return new DexiePromise(function(resolve, reject) {
      values.map(function(value) {
        return DexiePromise.resolve(value).then(resolve, reject);
      });
    });
  },
  PSD: {
    get: function() {
      return PSD;
    },
    set: function(value) {
      return PSD = value;
    }
  },
  newPSD: newScope,
  usePSD,
  scheduler: {
    get: function() {
      return asap$1;
    },
    set: function(value) {
      asap$1 = value;
    }
  },
  rejectionMapper: {
    get: function() {
      return rejectionMapper;
    },
    set: function(value) {
      rejectionMapper = value;
    }
  },
  follow: function(fn, zoneProps) {
    return new DexiePromise(function(resolve, reject) {
      return newScope(function(resolve2, reject2) {
        var psd = PSD;
        psd.unhandleds = [];
        psd.onunhandled = reject2;
        psd.finalize = callBoth(function() {
          var _this = this;
          run_at_end_of_this_or_next_physical_tick(function() {
            _this.unhandleds.length === 0 ? resolve2() : reject2(_this.unhandleds[0]);
          });
        }, psd.finalize);
        fn();
      }, zoneProps, resolve, reject);
    });
  }
});
if (NativePromise) {
  if (NativePromise.allSettled)
    setProp(DexiePromise, "allSettled", function() {
      var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
      return new DexiePromise(function(resolve) {
        if (possiblePromises.length === 0)
          resolve([]);
        var remaining = possiblePromises.length;
        var results = new Array(remaining);
        possiblePromises.forEach(function(p, i) {
          return DexiePromise.resolve(p).then(function(value) {
            return results[i] = {status: "fulfilled", value};
          }, function(reason) {
            return results[i] = {status: "rejected", reason};
          }).then(function() {
            return --remaining || resolve(results);
          });
        });
      });
    });
  if (NativePromise.any && typeof AggregateError !== "undefined")
    setProp(DexiePromise, "any", function() {
      var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
      return new DexiePromise(function(resolve, reject) {
        if (possiblePromises.length === 0)
          reject(new AggregateError([]));
        var remaining = possiblePromises.length;
        var failures = new Array(remaining);
        possiblePromises.forEach(function(p, i) {
          return DexiePromise.resolve(p).then(function(value) {
            return resolve(value);
          }, function(failure) {
            failures[i] = failure;
            if (!--remaining)
              reject(new AggregateError(failures));
          });
        });
      });
    });
}
function executePromiseTask(promise, fn) {
  try {
    fn(function(value) {
      if (promise._state !== null)
        return;
      if (value === promise)
        throw new TypeError("A promise cannot be resolved with itself.");
      var shouldExecuteTick = promise._lib && beginMicroTickScope();
      if (value && typeof value.then === "function") {
        executePromiseTask(promise, function(resolve, reject) {
          value instanceof DexiePromise ? value._then(resolve, reject) : value.then(resolve, reject);
        });
      } else {
        promise._state = true;
        promise._value = value;
        propagateAllListeners(promise);
      }
      if (shouldExecuteTick)
        endMicroTickScope();
    }, handleRejection.bind(null, promise));
  } catch (ex) {
    handleRejection(promise, ex);
  }
}
function handleRejection(promise, reason) {
  rejectingErrors.push(reason);
  if (promise._state !== null)
    return;
  var shouldExecuteTick = promise._lib && beginMicroTickScope();
  reason = rejectionMapper(reason);
  promise._state = false;
  promise._value = reason;
  debug && reason !== null && typeof reason === "object" && !reason._promise && tryCatch(function() {
    var origProp = getPropertyDescriptor(reason, "stack");
    reason._promise = promise;
    setProp(reason, "stack", {
      get: function() {
        return stack_being_generated ? origProp && (origProp.get ? origProp.get.apply(reason) : origProp.value) : promise.stack;
      }
    });
  });
  addPossiblyUnhandledError(promise);
  propagateAllListeners(promise);
  if (shouldExecuteTick)
    endMicroTickScope();
}
function propagateAllListeners(promise) {
  var listeners = promise._listeners;
  promise._listeners = [];
  for (var i = 0, len = listeners.length; i < len; ++i) {
    propagateToListener(promise, listeners[i]);
  }
  var psd = promise._PSD;
  --psd.ref || psd.finalize();
  if (numScheduledCalls === 0) {
    ++numScheduledCalls;
    asap$1(function() {
      if (--numScheduledCalls === 0)
        finalizePhysicalTick();
    }, []);
  }
}
function propagateToListener(promise, listener) {
  if (promise._state === null) {
    promise._listeners.push(listener);
    return;
  }
  var cb = promise._state ? listener.onFulfilled : listener.onRejected;
  if (cb === null) {
    return (promise._state ? listener.resolve : listener.reject)(promise._value);
  }
  ++listener.psd.ref;
  ++numScheduledCalls;
  asap$1(callListener, [cb, promise, listener]);
}
function callListener(cb, promise, listener) {
  try {
    currentFulfiller = promise;
    var ret, value = promise._value;
    if (promise._state) {
      ret = cb(value);
    } else {
      if (rejectingErrors.length)
        rejectingErrors = [];
      ret = cb(value);
      if (rejectingErrors.indexOf(value) === -1)
        markErrorAsHandled(promise);
    }
    listener.resolve(ret);
  } catch (e) {
    listener.reject(e);
  } finally {
    currentFulfiller = null;
    if (--numScheduledCalls === 0)
      finalizePhysicalTick();
    --listener.psd.ref || listener.psd.finalize();
  }
}
function getStack(promise, stacks, limit) {
  if (stacks.length === limit)
    return stacks;
  var stack = "";
  if (promise._state === false) {
    var failure = promise._value, errorName, message;
    if (failure != null) {
      errorName = failure.name || "Error";
      message = failure.message || failure;
      stack = prettyStack(failure, 0);
    } else {
      errorName = failure;
      message = "";
    }
    stacks.push(errorName + (message ? ": " + message : "") + stack);
  }
  if (debug) {
    stack = prettyStack(promise._stackHolder, 2);
    if (stack && stacks.indexOf(stack) === -1)
      stacks.push(stack);
    if (promise._prev)
      getStack(promise._prev, stacks, limit);
  }
  return stacks;
}
function linkToPreviousPromise(promise, prev) {
  var numPrev = prev ? prev._numPrev + 1 : 0;
  if (numPrev < LONG_STACKS_CLIP_LIMIT) {
    promise._prev = prev;
    promise._numPrev = numPrev;
  }
}
function physicalTick() {
  beginMicroTickScope() && endMicroTickScope();
}
function beginMicroTickScope() {
  var wasRootExec = isOutsideMicroTick;
  isOutsideMicroTick = false;
  needsNewPhysicalTick = false;
  return wasRootExec;
}
function endMicroTickScope() {
  var callbacks, i, l;
  do {
    while (microtickQueue.length > 0) {
      callbacks = microtickQueue;
      microtickQueue = [];
      l = callbacks.length;
      for (i = 0; i < l; ++i) {
        var item = callbacks[i];
        item[0].apply(null, item[1]);
      }
    }
  } while (microtickQueue.length > 0);
  isOutsideMicroTick = true;
  needsNewPhysicalTick = true;
}
function finalizePhysicalTick() {
  var unhandledErrs = unhandledErrors;
  unhandledErrors = [];
  unhandledErrs.forEach(function(p) {
    p._PSD.onunhandled.call(null, p._value, p);
  });
  var finalizers = tickFinalizers.slice(0);
  var i = finalizers.length;
  while (i)
    finalizers[--i]();
}
function run_at_end_of_this_or_next_physical_tick(fn) {
  function finalizer() {
    fn();
    tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
  }
  tickFinalizers.push(finalizer);
  ++numScheduledCalls;
  asap$1(function() {
    if (--numScheduledCalls === 0)
      finalizePhysicalTick();
  }, []);
}
function addPossiblyUnhandledError(promise) {
  if (!unhandledErrors.some(function(p) {
    return p._value === promise._value;
  }))
    unhandledErrors.push(promise);
}
function markErrorAsHandled(promise) {
  var i = unhandledErrors.length;
  while (i)
    if (unhandledErrors[--i]._value === promise._value) {
      unhandledErrors.splice(i, 1);
      return;
    }
}
function PromiseReject(reason) {
  return new DexiePromise(INTERNAL, false, reason);
}
function wrap(fn, errorCatcher) {
  var psd = PSD;
  return function() {
    var wasRootExec = beginMicroTickScope(), outerScope = PSD;
    try {
      switchToZone(psd, true);
      return fn.apply(this, arguments);
    } catch (e) {
      errorCatcher && errorCatcher(e);
    } finally {
      switchToZone(outerScope, false);
      if (wasRootExec)
        endMicroTickScope();
    }
  };
}
var task = {awaits: 0, echoes: 0, id: 0};
var taskCounter = 0;
var zoneStack = [];
var zoneEchoes = 0;
var totalEchoes = 0;
var zone_id_counter = 0;
function newScope(fn, props$$1, a1, a2) {
  var parent = PSD, psd = Object.create(parent);
  psd.parent = parent;
  psd.ref = 0;
  psd.global = false;
  psd.id = ++zone_id_counter;
  var globalEnv = globalPSD.env;
  psd.env = patchGlobalPromise ? {
    Promise: DexiePromise,
    PromiseProp: {value: DexiePromise, configurable: true, writable: true},
    all: DexiePromise.all,
    race: DexiePromise.race,
    allSettled: DexiePromise.allSettled,
    any: DexiePromise.any,
    resolve: DexiePromise.resolve,
    reject: DexiePromise.reject,
    nthen: getPatchedPromiseThen(globalEnv.nthen, psd),
    gthen: getPatchedPromiseThen(globalEnv.gthen, psd)
  } : {};
  if (props$$1)
    extend(psd, props$$1);
  ++parent.ref;
  psd.finalize = function() {
    --this.parent.ref || this.parent.finalize();
  };
  var rv = usePSD(psd, fn, a1, a2);
  if (psd.ref === 0)
    psd.finalize();
  return rv;
}
function incrementExpectedAwaits() {
  if (!task.id)
    task.id = ++taskCounter;
  ++task.awaits;
  task.echoes += ZONE_ECHO_LIMIT;
  return task.id;
}
function decrementExpectedAwaits(sourceTaskId) {
  if (!task.awaits || sourceTaskId && sourceTaskId !== task.id)
    return;
  if (--task.awaits === 0)
    task.id = 0;
  task.echoes = task.awaits * ZONE_ECHO_LIMIT;
}
if (("" + nativePromiseThen).indexOf("[native code]") === -1) {
  incrementExpectedAwaits = decrementExpectedAwaits = nop;
}
function onPossibleParallellAsync(possiblePromise) {
  if (task.echoes && possiblePromise && possiblePromise.constructor === NativePromise) {
    incrementExpectedAwaits();
    return possiblePromise.then(function(x) {
      decrementExpectedAwaits();
      return x;
    }, function(e) {
      decrementExpectedAwaits();
      return rejection(e);
    });
  }
  return possiblePromise;
}
function zoneEnterEcho(targetZone) {
  ++totalEchoes;
  if (!task.echoes || --task.echoes === 0) {
    task.echoes = task.id = 0;
  }
  zoneStack.push(PSD);
  switchToZone(targetZone, true);
}
function zoneLeaveEcho() {
  var zone = zoneStack[zoneStack.length - 1];
  zoneStack.pop();
  switchToZone(zone, false);
}
function switchToZone(targetZone, bEnteringZone) {
  var currentZone = PSD;
  if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (!--zoneEchoes || targetZone !== PSD)) {
    enqueueNativeMicroTask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
  }
  if (targetZone === PSD)
    return;
  PSD = targetZone;
  if (currentZone === globalPSD)
    globalPSD.env = snapShot();
  if (patchGlobalPromise) {
    var GlobalPromise_1 = globalPSD.env.Promise;
    var targetEnv = targetZone.env;
    nativePromiseProto.then = targetEnv.nthen;
    GlobalPromise_1.prototype.then = targetEnv.gthen;
    if (currentZone.global || targetZone.global) {
      Object.defineProperty(_global, "Promise", targetEnv.PromiseProp);
      GlobalPromise_1.all = targetEnv.all;
      GlobalPromise_1.race = targetEnv.race;
      GlobalPromise_1.resolve = targetEnv.resolve;
      GlobalPromise_1.reject = targetEnv.reject;
      if (targetEnv.allSettled)
        GlobalPromise_1.allSettled = targetEnv.allSettled;
      if (targetEnv.any)
        GlobalPromise_1.any = targetEnv.any;
    }
  }
}
function snapShot() {
  var GlobalPromise = _global.Promise;
  return patchGlobalPromise ? {
    Promise: GlobalPromise,
    PromiseProp: Object.getOwnPropertyDescriptor(_global, "Promise"),
    all: GlobalPromise.all,
    race: GlobalPromise.race,
    allSettled: GlobalPromise.allSettled,
    any: GlobalPromise.any,
    resolve: GlobalPromise.resolve,
    reject: GlobalPromise.reject,
    nthen: nativePromiseProto.then,
    gthen: GlobalPromise.prototype.then
  } : {};
}
function usePSD(psd, fn, a1, a2, a3) {
  var outerScope = PSD;
  try {
    switchToZone(psd, true);
    return fn(a1, a2, a3);
  } finally {
    switchToZone(outerScope, false);
  }
}
function enqueueNativeMicroTask(job) {
  nativePromiseThen.call(resolvedNativePromise, job);
}
function nativeAwaitCompatibleWrap(fn, zone, possibleAwait) {
  return typeof fn !== "function" ? fn : function() {
    var outerZone = PSD;
    if (possibleAwait)
      incrementExpectedAwaits();
    switchToZone(zone, true);
    try {
      return fn.apply(this, arguments);
    } finally {
      switchToZone(outerZone, false);
    }
  };
}
function getPatchedPromiseThen(origThen, zone) {
  return function(onResolved, onRejected) {
    return origThen.call(this, nativeAwaitCompatibleWrap(onResolved, zone, false), nativeAwaitCompatibleWrap(onRejected, zone, false));
  };
}
var UNHANDLEDREJECTION = "unhandledrejection";
function globalError(err, promise) {
  var rv;
  try {
    rv = promise.onuncatched(err);
  } catch (e) {
  }
  if (rv !== false)
    try {
      var event, eventData = {promise, reason: err};
      if (_global.document && document.createEvent) {
        event = document.createEvent("Event");
        event.initEvent(UNHANDLEDREJECTION, true, true);
        extend(event, eventData);
      } else if (_global.CustomEvent) {
        event = new CustomEvent(UNHANDLEDREJECTION, {detail: eventData});
        extend(event, eventData);
      }
      if (event && _global.dispatchEvent) {
        dispatchEvent(event);
        if (!_global.PromiseRejectionEvent && _global.onunhandledrejection)
          try {
            _global.onunhandledrejection(event);
          } catch (_23) {
          }
      }
      if (debug && event && !event.defaultPrevented) {
        console.warn("Unhandled rejection: " + (err.stack || err));
      }
    } catch (e) {
    }
}
var rejection = DexiePromise.reject;
function tempTransaction(db, mode, storeNames, fn) {
  if (!db._state.openComplete && !PSD.letThrough) {
    if (!db._state.isBeingOpened) {
      if (!db._options.autoOpen)
        return rejection(new exceptions.DatabaseClosed());
      db.open().catch(nop);
    }
    return db._state.dbReadyPromise.then(function() {
      return tempTransaction(db, mode, storeNames, fn);
    });
  } else {
    var trans = db._createTransaction(mode, storeNames, db._dbSchema);
    try {
      trans.create();
    } catch (ex) {
      return rejection(ex);
    }
    return trans._promise(mode, function(resolve, reject) {
      return newScope(function() {
        PSD.trans = trans;
        return fn(resolve, reject, trans);
      });
    }).then(function(result) {
      return trans._completion.then(function() {
        return result;
      });
    });
  }
}
var DEXIE_VERSION = "3.0.1";
var maxString = String.fromCharCode(65535);
var minKey = -Infinity;
var INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
var STRING_EXPECTED = "String expected.";
var connections = [];
var isIEOrEdge = typeof navigator !== "undefined" && /(MSIE|Trident|Edge)/.test(navigator.userAgent);
var hasIEDeleteObjectStoreBug = isIEOrEdge;
var hangsOnDeleteLargeKeyRange = isIEOrEdge;
var dexieStackFrameFilter = function(frame) {
  return !/(dexie\.js|dexie\.min\.js)/.test(frame);
};
var DBNAMES_DB = "__dbnames";
var READONLY = "readonly";
var READWRITE = "readwrite";
function combine(filter1, filter2) {
  return filter1 ? filter2 ? function() {
    return filter1.apply(this, arguments) && filter2.apply(this, arguments);
  } : filter1 : filter2;
}
var AnyRange = {
  type: 3,
  lower: -Infinity,
  lowerOpen: false,
  upper: [[]],
  upperOpen: false
};
var Table = function() {
  function Table4() {
  }
  Table4.prototype._trans = function(mode, fn, writeLocked) {
    var trans = this._tx || PSD.trans;
    var tableName = this.name;
    function checkTableInTransaction(resolve, reject, trans2) {
      if (!trans2.schema[tableName])
        throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
      return fn(trans2.idbtrans, trans2);
    }
    var wasRootExec = beginMicroTickScope();
    try {
      return trans && trans.db === this.db ? trans === PSD.trans ? trans._promise(mode, checkTableInTransaction, writeLocked) : newScope(function() {
        return trans._promise(mode, checkTableInTransaction, writeLocked);
      }, {trans, transless: PSD.transless || PSD}) : tempTransaction(this.db, mode, [this.name], checkTableInTransaction);
    } finally {
      if (wasRootExec)
        endMicroTickScope();
    }
  };
  Table4.prototype.get = function(keyOrCrit, cb) {
    var _this = this;
    if (keyOrCrit && keyOrCrit.constructor === Object)
      return this.where(keyOrCrit).first(cb);
    return this._trans("readonly", function(trans) {
      return _this.core.get({trans, key: keyOrCrit}).then(function(res) {
        return _this.hook.reading.fire(res);
      });
    }).then(cb);
  };
  Table4.prototype.where = function(indexOrCrit) {
    if (typeof indexOrCrit === "string")
      return new this.db.WhereClause(this, indexOrCrit);
    if (isArray(indexOrCrit))
      return new this.db.WhereClause(this, "[" + indexOrCrit.join("+") + "]");
    var keyPaths = keys(indexOrCrit);
    if (keyPaths.length === 1)
      return this.where(keyPaths[0]).equals(indexOrCrit[keyPaths[0]]);
    var compoundIndex = this.schema.indexes.concat(this.schema.primKey).filter(function(ix) {
      return ix.compound && keyPaths.every(function(keyPath) {
        return ix.keyPath.indexOf(keyPath) >= 0;
      }) && ix.keyPath.every(function(keyPath) {
        return keyPaths.indexOf(keyPath) >= 0;
      });
    })[0];
    if (compoundIndex && this.db._maxKey !== maxString)
      return this.where(compoundIndex.name).equals(compoundIndex.keyPath.map(function(kp) {
        return indexOrCrit[kp];
      }));
    if (!compoundIndex && debug)
      console.warn("The query " + JSON.stringify(indexOrCrit) + " on " + this.name + " would benefit of a " + ("compound index [" + keyPaths.join("+") + "]"));
    var idxByName = this.schema.idxByName;
    var idb = this.db._deps.indexedDB;
    function equals(a, b) {
      try {
        return idb.cmp(a, b) === 0;
      } catch (e) {
        return false;
      }
    }
    var _a2 = keyPaths.reduce(function(_a3, keyPath) {
      var prevIndex = _a3[0], prevFilterFn = _a3[1];
      var index10 = idxByName[keyPath];
      var value = indexOrCrit[keyPath];
      return [
        prevIndex || index10,
        prevIndex || !index10 ? combine(prevFilterFn, index10 && index10.multi ? function(x) {
          var prop = getByKeyPath(x, keyPath);
          return isArray(prop) && prop.some(function(item) {
            return equals(value, item);
          });
        } : function(x) {
          return equals(value, getByKeyPath(x, keyPath));
        }) : prevFilterFn
      ];
    }, [null, null]), idx = _a2[0], filterFunction = _a2[1];
    return idx ? this.where(idx.name).equals(indexOrCrit[idx.keyPath]).filter(filterFunction) : compoundIndex ? this.filter(filterFunction) : this.where(keyPaths).equals("");
  };
  Table4.prototype.filter = function(filterFunction) {
    return this.toCollection().and(filterFunction);
  };
  Table4.prototype.count = function(thenShortcut) {
    return this.toCollection().count(thenShortcut);
  };
  Table4.prototype.offset = function(offset) {
    return this.toCollection().offset(offset);
  };
  Table4.prototype.limit = function(numRows) {
    return this.toCollection().limit(numRows);
  };
  Table4.prototype.each = function(callback) {
    return this.toCollection().each(callback);
  };
  Table4.prototype.toArray = function(thenShortcut) {
    return this.toCollection().toArray(thenShortcut);
  };
  Table4.prototype.toCollection = function() {
    return new this.db.Collection(new this.db.WhereClause(this));
  };
  Table4.prototype.orderBy = function(index10) {
    return new this.db.Collection(new this.db.WhereClause(this, isArray(index10) ? "[" + index10.join("+") + "]" : index10));
  };
  Table4.prototype.reverse = function() {
    return this.toCollection().reverse();
  };
  Table4.prototype.mapToClass = function(constructor) {
    this.schema.mappedClass = constructor;
    var readHook = function(obj) {
      if (!obj)
        return obj;
      var res = Object.create(constructor.prototype);
      for (var m in obj)
        if (hasOwn(obj, m))
          try {
            res[m] = obj[m];
          } catch (_23) {
          }
      return res;
    };
    if (this.schema.readHook) {
      this.hook.reading.unsubscribe(this.schema.readHook);
    }
    this.schema.readHook = readHook;
    this.hook("reading", readHook);
    return constructor;
  };
  Table4.prototype.defineClass = function() {
    function Class(content) {
      extend(this, content);
    }
    return this.mapToClass(Class);
  };
  Table4.prototype.add = function(obj, key2) {
    var _this = this;
    return this._trans("readwrite", function(trans) {
      return _this.core.mutate({trans, type: "add", keys: key2 != null ? [key2] : null, values: [obj]});
    }).then(function(res) {
      return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult;
    }).then(function(lastResult) {
      if (!_this.core.schema.primaryKey.outbound) {
        try {
          setByKeyPath(obj, _this.core.schema.primaryKey.keyPath, lastResult);
        } catch (_23) {
        }
      }
      return lastResult;
    });
  };
  Table4.prototype.update = function(keyOrObject, modifications) {
    if (typeof modifications !== "object" || isArray(modifications))
      throw new exceptions.InvalidArgument("Modifications must be an object.");
    if (typeof keyOrObject === "object" && !isArray(keyOrObject)) {
      keys(modifications).forEach(function(keyPath) {
        setByKeyPath(keyOrObject, keyPath, modifications[keyPath]);
      });
      var key2 = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
      if (key2 === void 0)
        return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"));
      return this.where(":id").equals(key2).modify(modifications);
    } else {
      return this.where(":id").equals(keyOrObject).modify(modifications);
    }
  };
  Table4.prototype.put = function(obj, key2) {
    var _this = this;
    return this._trans("readwrite", function(trans) {
      return _this.core.mutate({trans, type: "put", values: [obj], keys: key2 != null ? [key2] : null});
    }).then(function(res) {
      return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult;
    }).then(function(lastResult) {
      if (!_this.core.schema.primaryKey.outbound) {
        try {
          setByKeyPath(obj, _this.core.schema.primaryKey.keyPath, lastResult);
        } catch (_23) {
        }
      }
      return lastResult;
    });
  };
  Table4.prototype.delete = function(key2) {
    var _this = this;
    return this._trans("readwrite", function(trans) {
      return _this.core.mutate({trans, type: "delete", keys: [key2]});
    }).then(function(res) {
      return res.numFailures ? DexiePromise.reject(res.failures[0]) : void 0;
    });
  };
  Table4.prototype.clear = function() {
    var _this = this;
    return this._trans("readwrite", function(trans) {
      return _this.core.mutate({trans, type: "deleteRange", range: AnyRange});
    }).then(function(res) {
      return res.numFailures ? DexiePromise.reject(res.failures[0]) : void 0;
    });
  };
  Table4.prototype.bulkGet = function(keys$$1) {
    var _this = this;
    return this._trans("readonly", function(trans) {
      return _this.core.getMany({
        keys: keys$$1,
        trans
      });
    });
  };
  Table4.prototype.bulkAdd = function(objects, keysOrOptions, options) {
    var _this = this;
    var keys$$1 = Array.isArray(keysOrOptions) ? keysOrOptions : void 0;
    options = options || (keys$$1 ? void 0 : keysOrOptions);
    var wantResults = options ? options.allKeys : void 0;
    return this._trans("readwrite", function(trans) {
      var outbound = _this.core.schema.primaryKey.outbound;
      if (!outbound && keys$$1)
        throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
      if (keys$$1 && keys$$1.length !== objects.length)
        throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
      var numObjects = objects.length;
      return _this.core.mutate({trans, type: "add", keys: keys$$1, values: objects, wantResults}).then(function(_a2) {
        var numFailures = _a2.numFailures, results = _a2.results, lastResult = _a2.lastResult, failures = _a2.failures;
        var result = wantResults ? results : lastResult;
        if (numFailures === 0)
          return result;
        throw new BulkError(_this.name + ".bulkAdd(): " + numFailures + " of " + numObjects + " operations failed", Object.keys(failures).map(function(pos) {
          return failures[pos];
        }));
      });
    });
  };
  Table4.prototype.bulkPut = function(objects, keysOrOptions, options) {
    var _this = this;
    var keys$$1 = Array.isArray(keysOrOptions) ? keysOrOptions : void 0;
    options = options || (keys$$1 ? void 0 : keysOrOptions);
    var wantResults = options ? options.allKeys : void 0;
    return this._trans("readwrite", function(trans) {
      var outbound = _this.core.schema.primaryKey.outbound;
      if (!outbound && keys$$1)
        throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
      if (keys$$1 && keys$$1.length !== objects.length)
        throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
      var numObjects = objects.length;
      return _this.core.mutate({trans, type: "put", keys: keys$$1, values: objects, wantResults}).then(function(_a2) {
        var numFailures = _a2.numFailures, results = _a2.results, lastResult = _a2.lastResult, failures = _a2.failures;
        var result = wantResults ? results : lastResult;
        if (numFailures === 0)
          return result;
        throw new BulkError(_this.name + ".bulkPut(): " + numFailures + " of " + numObjects + " operations failed", Object.keys(failures).map(function(pos) {
          return failures[pos];
        }));
      });
    });
  };
  Table4.prototype.bulkDelete = function(keys$$1) {
    var _this = this;
    var numKeys = keys$$1.length;
    return this._trans("readwrite", function(trans) {
      return _this.core.mutate({trans, type: "delete", keys: keys$$1});
    }).then(function(_a2) {
      var numFailures = _a2.numFailures, lastResult = _a2.lastResult, failures = _a2.failures;
      if (numFailures === 0)
        return lastResult;
      throw new BulkError(_this.name + ".bulkDelete(): " + numFailures + " of " + numKeys + " operations failed", failures);
    });
  };
  return Table4;
}();
function Events(ctx) {
  var evs = {};
  var rv = function(eventName, subscriber) {
    if (subscriber) {
      var i2 = arguments.length, args = new Array(i2 - 1);
      while (--i2)
        args[i2 - 1] = arguments[i2];
      evs[eventName].subscribe.apply(null, args);
      return ctx;
    } else if (typeof eventName === "string") {
      return evs[eventName];
    }
  };
  rv.addEventType = add3;
  for (var i = 1, l = arguments.length; i < l; ++i) {
    add3(arguments[i]);
  }
  return rv;
  function add3(eventName, chainFunction, defaultFunction) {
    if (typeof eventName === "object")
      return addConfiguredEvents(eventName);
    if (!chainFunction)
      chainFunction = reverseStoppableEventChain;
    if (!defaultFunction)
      defaultFunction = nop;
    var context = {
      subscribers: [],
      fire: defaultFunction,
      subscribe: function(cb) {
        if (context.subscribers.indexOf(cb) === -1) {
          context.subscribers.push(cb);
          context.fire = chainFunction(context.fire, cb);
        }
      },
      unsubscribe: function(cb) {
        context.subscribers = context.subscribers.filter(function(fn) {
          return fn !== cb;
        });
        context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
      }
    };
    evs[eventName] = rv[eventName] = context;
    return context;
  }
  function addConfiguredEvents(cfg) {
    keys(cfg).forEach(function(eventName) {
      var args = cfg[eventName];
      if (isArray(args)) {
        add3(eventName, cfg[eventName][0], cfg[eventName][1]);
      } else if (args === "asap") {
        var context = add3(eventName, mirror, function fire() {
          var i2 = arguments.length, args2 = new Array(i2);
          while (i2--)
            args2[i2] = arguments[i2];
          context.subscribers.forEach(function(fn) {
            asap(function fireEvent() {
              fn.apply(null, args2);
            });
          });
        });
      } else
        throw new exceptions.InvalidArgument("Invalid event config");
    });
  }
}
function makeClassConstructor(prototype, constructor) {
  derive(constructor).from({prototype});
  return constructor;
}
function createTableConstructor(db) {
  return makeClassConstructor(Table.prototype, function Table$$1(name, tableSchema, trans) {
    this.db = db;
    this._tx = trans;
    this.name = name;
    this.schema = tableSchema;
    this.hook = db._allTables[name] ? db._allTables[name].hook : Events(null, {
      creating: [hookCreatingChain, nop],
      reading: [pureFunctionChain, mirror],
      updating: [hookUpdatingChain, nop],
      deleting: [hookDeletingChain, nop]
    });
  });
}
function isPlainKeyRange(ctx, ignoreLimitFilter) {
  return !(ctx.filter || ctx.algorithm || ctx.or) && (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
}
function addFilter(ctx, fn) {
  ctx.filter = combine(ctx.filter, fn);
}
function addReplayFilter(ctx, factory, isLimitFilter) {
  var curr = ctx.replayFilter;
  ctx.replayFilter = curr ? function() {
    return combine(curr(), factory());
  } : factory;
  ctx.justLimit = isLimitFilter && !curr;
}
function addMatchFilter(ctx, fn) {
  ctx.isMatch = combine(ctx.isMatch, fn);
}
function getIndexOrStore(ctx, coreSchema) {
  if (ctx.isPrimKey)
    return coreSchema.primaryKey;
  var index10 = coreSchema.getIndexByKeyPath(ctx.index);
  if (!index10)
    throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + coreSchema.name + " is not indexed");
  return index10;
}
function openCursor(ctx, coreTable, trans) {
  var index10 = getIndexOrStore(ctx, coreTable.schema);
  return coreTable.openCursor({
    trans,
    values: !ctx.keysOnly,
    reverse: ctx.dir === "prev",
    unique: !!ctx.unique,
    query: {
      index: index10,
      range: ctx.range
    }
  });
}
function iter(ctx, fn, coreTrans, coreTable) {
  var filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
  if (!ctx.or) {
    return iterate(openCursor(ctx, coreTable, coreTrans), combine(ctx.algorithm, filter), fn, !ctx.keysOnly && ctx.valueMapper);
  } else {
    var set_1 = {};
    var union = function(item, cursor, advance) {
      if (!filter || filter(cursor, advance, function(result) {
        return cursor.stop(result);
      }, function(err) {
        return cursor.fail(err);
      })) {
        var primaryKey = cursor.primaryKey;
        var key2 = "" + primaryKey;
        if (key2 === "[object ArrayBuffer]")
          key2 = "" + new Uint8Array(primaryKey);
        if (!hasOwn(set_1, key2)) {
          set_1[key2] = true;
          fn(item, cursor, advance);
        }
      }
    };
    return Promise.all([
      ctx.or._iterate(union, coreTrans),
      iterate(openCursor(ctx, coreTable, coreTrans), ctx.algorithm, union, !ctx.keysOnly && ctx.valueMapper)
    ]);
  }
}
function iterate(cursorPromise, filter, fn, valueMapper) {
  var mappedFn = valueMapper ? function(x, c, a) {
    return fn(valueMapper(x), c, a);
  } : fn;
  var wrappedFn = wrap(mappedFn);
  return cursorPromise.then(function(cursor) {
    if (cursor) {
      return cursor.start(function() {
        var c = function() {
          return cursor.continue();
        };
        if (!filter || filter(cursor, function(advancer) {
          return c = advancer;
        }, function(val) {
          cursor.stop(val);
          c = nop;
        }, function(e) {
          cursor.fail(e);
          c = nop;
        }))
          wrappedFn(cursor.value, cursor, function(advancer) {
            return c = advancer;
          });
        c();
      });
    }
  });
}
var Collection = function() {
  function Collection2() {
  }
  Collection2.prototype._read = function(fn, cb) {
    var ctx = this._ctx;
    return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._trans("readonly", fn).then(cb);
  };
  Collection2.prototype._write = function(fn) {
    var ctx = this._ctx;
    return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._trans("readwrite", fn, "locked");
  };
  Collection2.prototype._addAlgorithm = function(fn) {
    var ctx = this._ctx;
    ctx.algorithm = combine(ctx.algorithm, fn);
  };
  Collection2.prototype._iterate = function(fn, coreTrans) {
    return iter(this._ctx, fn, coreTrans, this._ctx.table.core);
  };
  Collection2.prototype.clone = function(props$$1) {
    var rv = Object.create(this.constructor.prototype), ctx = Object.create(this._ctx);
    if (props$$1)
      extend(ctx, props$$1);
    rv._ctx = ctx;
    return rv;
  };
  Collection2.prototype.raw = function() {
    this._ctx.valueMapper = null;
    return this;
  };
  Collection2.prototype.each = function(fn) {
    var ctx = this._ctx;
    return this._read(function(trans) {
      return iter(ctx, fn, trans, ctx.table.core);
    });
  };
  Collection2.prototype.count = function(cb) {
    var _this = this;
    return this._read(function(trans) {
      var ctx = _this._ctx;
      var coreTable = ctx.table.core;
      if (isPlainKeyRange(ctx, true)) {
        return coreTable.count({
          trans,
          query: {
            index: getIndexOrStore(ctx, coreTable.schema),
            range: ctx.range
          }
        }).then(function(count2) {
          return Math.min(count2, ctx.limit);
        });
      } else {
        var count = 0;
        return iter(ctx, function() {
          ++count;
          return false;
        }, trans, coreTable).then(function() {
          return count;
        });
      }
    }).then(cb);
  };
  Collection2.prototype.sortBy = function(keyPath, cb) {
    var parts = keyPath.split(".").reverse(), lastPart = parts[0], lastIndex = parts.length - 1;
    function getval(obj, i) {
      if (i)
        return getval(obj[parts[i]], i - 1);
      return obj[lastPart];
    }
    var order = this._ctx.dir === "next" ? 1 : -1;
    function sorter(a, b) {
      var aVal = getval(a, lastIndex), bVal = getval(b, lastIndex);
      return aVal < bVal ? -order : aVal > bVal ? order : 0;
    }
    return this.toArray(function(a) {
      return a.sort(sorter);
    }).then(cb);
  };
  Collection2.prototype.toArray = function(cb) {
    var _this = this;
    return this._read(function(trans) {
      var ctx = _this._ctx;
      if (ctx.dir === "next" && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
        var valueMapper_1 = ctx.valueMapper;
        var index10 = getIndexOrStore(ctx, ctx.table.core.schema);
        return ctx.table.core.query({
          trans,
          limit: ctx.limit,
          values: true,
          query: {
            index: index10,
            range: ctx.range
          }
        }).then(function(_a2) {
          var result = _a2.result;
          return valueMapper_1 ? result.map(valueMapper_1) : result;
        });
      } else {
        var a_1 = [];
        return iter(ctx, function(item) {
          return a_1.push(item);
        }, trans, ctx.table.core).then(function() {
          return a_1;
        });
      }
    }, cb);
  };
  Collection2.prototype.offset = function(offset) {
    var ctx = this._ctx;
    if (offset <= 0)
      return this;
    ctx.offset += offset;
    if (isPlainKeyRange(ctx)) {
      addReplayFilter(ctx, function() {
        var offsetLeft = offset;
        return function(cursor, advance) {
          if (offsetLeft === 0)
            return true;
          if (offsetLeft === 1) {
            --offsetLeft;
            return false;
          }
          advance(function() {
            cursor.advance(offsetLeft);
            offsetLeft = 0;
          });
          return false;
        };
      });
    } else {
      addReplayFilter(ctx, function() {
        var offsetLeft = offset;
        return function() {
          return --offsetLeft < 0;
        };
      });
    }
    return this;
  };
  Collection2.prototype.limit = function(numRows) {
    this._ctx.limit = Math.min(this._ctx.limit, numRows);
    addReplayFilter(this._ctx, function() {
      var rowsLeft = numRows;
      return function(cursor, advance, resolve) {
        if (--rowsLeft <= 0)
          advance(resolve);
        return rowsLeft >= 0;
      };
    }, true);
    return this;
  };
  Collection2.prototype.until = function(filterFunction, bIncludeStopEntry) {
    addFilter(this._ctx, function(cursor, advance, resolve) {
      if (filterFunction(cursor.value)) {
        advance(resolve);
        return bIncludeStopEntry;
      } else {
        return true;
      }
    });
    return this;
  };
  Collection2.prototype.first = function(cb) {
    return this.limit(1).toArray(function(a) {
      return a[0];
    }).then(cb);
  };
  Collection2.prototype.last = function(cb) {
    return this.reverse().first(cb);
  };
  Collection2.prototype.filter = function(filterFunction) {
    addFilter(this._ctx, function(cursor) {
      return filterFunction(cursor.value);
    });
    addMatchFilter(this._ctx, filterFunction);
    return this;
  };
  Collection2.prototype.and = function(filter) {
    return this.filter(filter);
  };
  Collection2.prototype.or = function(indexName) {
    return new this.db.WhereClause(this._ctx.table, indexName, this);
  };
  Collection2.prototype.reverse = function() {
    this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev";
    if (this._ondirectionchange)
      this._ondirectionchange(this._ctx.dir);
    return this;
  };
  Collection2.prototype.desc = function() {
    return this.reverse();
  };
  Collection2.prototype.eachKey = function(cb) {
    var ctx = this._ctx;
    ctx.keysOnly = !ctx.isMatch;
    return this.each(function(val, cursor) {
      cb(cursor.key, cursor);
    });
  };
  Collection2.prototype.eachUniqueKey = function(cb) {
    this._ctx.unique = "unique";
    return this.eachKey(cb);
  };
  Collection2.prototype.eachPrimaryKey = function(cb) {
    var ctx = this._ctx;
    ctx.keysOnly = !ctx.isMatch;
    return this.each(function(val, cursor) {
      cb(cursor.primaryKey, cursor);
    });
  };
  Collection2.prototype.keys = function(cb) {
    var ctx = this._ctx;
    ctx.keysOnly = !ctx.isMatch;
    var a = [];
    return this.each(function(item, cursor) {
      a.push(cursor.key);
    }).then(function() {
      return a;
    }).then(cb);
  };
  Collection2.prototype.primaryKeys = function(cb) {
    var ctx = this._ctx;
    if (ctx.dir === "next" && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
      return this._read(function(trans) {
        var index10 = getIndexOrStore(ctx, ctx.table.core.schema);
        return ctx.table.core.query({
          trans,
          values: false,
          limit: ctx.limit,
          query: {
            index: index10,
            range: ctx.range
          }
        });
      }).then(function(_a2) {
        var result = _a2.result;
        return result;
      }).then(cb);
    }
    ctx.keysOnly = !ctx.isMatch;
    var a = [];
    return this.each(function(item, cursor) {
      a.push(cursor.primaryKey);
    }).then(function() {
      return a;
    }).then(cb);
  };
  Collection2.prototype.uniqueKeys = function(cb) {
    this._ctx.unique = "unique";
    return this.keys(cb);
  };
  Collection2.prototype.firstKey = function(cb) {
    return this.limit(1).keys(function(a) {
      return a[0];
    }).then(cb);
  };
  Collection2.prototype.lastKey = function(cb) {
    return this.reverse().firstKey(cb);
  };
  Collection2.prototype.distinct = function() {
    var ctx = this._ctx, idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
    if (!idx || !idx.multi)
      return this;
    var set5 = {};
    addFilter(this._ctx, function(cursor) {
      var strKey = cursor.primaryKey.toString();
      var found = hasOwn(set5, strKey);
      set5[strKey] = true;
      return !found;
    });
    return this;
  };
  Collection2.prototype.modify = function(changes) {
    var _this = this;
    var ctx = this._ctx;
    return this._write(function(trans) {
      var modifyer;
      if (typeof changes === "function") {
        modifyer = changes;
      } else {
        var keyPaths = keys(changes);
        var numKeys = keyPaths.length;
        modifyer = function(item) {
          var anythingModified = false;
          for (var i = 0; i < numKeys; ++i) {
            var keyPath = keyPaths[i], val = changes[keyPath];
            if (getByKeyPath(item, keyPath) !== val) {
              setByKeyPath(item, keyPath, val);
              anythingModified = true;
            }
          }
          return anythingModified;
        };
      }
      var coreTable = ctx.table.core;
      var _a2 = coreTable.schema.primaryKey, outbound = _a2.outbound, extractKey = _a2.extractKey;
      var limit = "testmode" in Dexie ? 1 : 2e3;
      var cmp = _this.db.core.cmp;
      var totalFailures = [];
      var successCount = 0;
      var failedKeys = [];
      var applyMutateResult = function(expectedCount, res) {
        var failures = res.failures, numFailures = res.numFailures;
        successCount += expectedCount - numFailures;
        for (var _i = 0, _a3 = keys(failures); _i < _a3.length; _i++) {
          var pos = _a3[_i];
          totalFailures.push(failures[pos]);
        }
      };
      return _this.clone().primaryKeys().then(function(keys$$1) {
        var nextChunk = function(offset) {
          var count = Math.min(limit, keys$$1.length - offset);
          return coreTable.getMany({trans, keys: keys$$1.slice(offset, offset + count)}).then(function(values) {
            var addValues = [];
            var putValues = [];
            var putKeys = outbound ? [] : null;
            var deleteKeys = [];
            for (var i = 0; i < count; ++i) {
              var origValue = values[i];
              var ctx_1 = {
                value: deepClone(origValue),
                primKey: keys$$1[offset + i]
              };
              if (modifyer.call(ctx_1, ctx_1.value, ctx_1) !== false) {
                if (ctx_1.value == null) {
                  deleteKeys.push(keys$$1[offset + i]);
                } else if (!outbound && cmp(extractKey(origValue), extractKey(ctx_1.value)) !== 0) {
                  deleteKeys.push(keys$$1[offset + i]);
                  addValues.push(ctx_1.value);
                } else {
                  putValues.push(ctx_1.value);
                  if (outbound)
                    putKeys.push(keys$$1[offset + i]);
                }
              }
            }
            return Promise.resolve(addValues.length > 0 && coreTable.mutate({trans, type: "add", values: addValues}).then(function(res) {
              for (var pos in res.failures) {
                deleteKeys.splice(parseInt(pos), 1);
              }
              applyMutateResult(addValues.length, res);
            })).then(function(res) {
              return putValues.length > 0 && coreTable.mutate({trans, type: "put", keys: putKeys, values: putValues}).then(function(res2) {
                return applyMutateResult(putValues.length, res2);
              });
            }).then(function() {
              return deleteKeys.length > 0 && coreTable.mutate({trans, type: "delete", keys: deleteKeys}).then(function(res) {
                return applyMutateResult(deleteKeys.length, res);
              });
            }).then(function() {
              return keys$$1.length > offset + count && nextChunk(offset + limit);
            });
          });
        };
        return nextChunk(0).then(function() {
          if (totalFailures.length > 0)
            throw new ModifyError("Error modifying one or more objects", totalFailures, successCount, failedKeys);
          return keys$$1.length;
        });
      });
    });
  };
  Collection2.prototype.delete = function() {
    var ctx = this._ctx, range = ctx.range;
    if (isPlainKeyRange(ctx) && (ctx.isPrimKey && !hangsOnDeleteLargeKeyRange || range.type === 3)) {
      return this._write(function(trans) {
        var primaryKey = ctx.table.core.schema.primaryKey;
        var coreRange = range;
        return ctx.table.core.count({trans, query: {index: primaryKey, range: coreRange}}).then(function(count) {
          return ctx.table.core.mutate({trans, type: "deleteRange", range: coreRange}).then(function(_a2) {
            var failures = _a2.failures, lastResult = _a2.lastResult, results = _a2.results, numFailures = _a2.numFailures;
            if (numFailures)
              throw new ModifyError("Could not delete some values", Object.keys(failures).map(function(pos) {
                return failures[pos];
              }), count - numFailures);
            return count - numFailures;
          });
        });
      });
    }
    return this.modify(function(value, ctx2) {
      return ctx2.value = null;
    });
  };
  return Collection2;
}();
function createCollectionConstructor(db) {
  return makeClassConstructor(Collection.prototype, function Collection$$1(whereClause, keyRangeGenerator) {
    this.db = db;
    var keyRange = AnyRange, error = null;
    if (keyRangeGenerator)
      try {
        keyRange = keyRangeGenerator();
      } catch (ex) {
        error = ex;
      }
    var whereCtx = whereClause._ctx;
    var table = whereCtx.table;
    var readingHook = table.hook.reading.fire;
    this._ctx = {
      table,
      index: whereCtx.index,
      isPrimKey: !whereCtx.index || table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name,
      range: keyRange,
      keysOnly: false,
      dir: "next",
      unique: "",
      algorithm: null,
      filter: null,
      replayFilter: null,
      justLimit: true,
      isMatch: null,
      offset: 0,
      limit: Infinity,
      error,
      or: whereCtx.or,
      valueMapper: readingHook !== mirror ? readingHook : null
    };
  });
}
function simpleCompare(a, b) {
  return a < b ? -1 : a === b ? 0 : 1;
}
function simpleCompareReverse(a, b) {
  return a > b ? -1 : a === b ? 0 : 1;
}
function fail(collectionOrWhereClause, err, T) {
  var collection = collectionOrWhereClause instanceof WhereClause ? new collectionOrWhereClause.Collection(collectionOrWhereClause) : collectionOrWhereClause;
  collection._ctx.error = T ? new T(err) : new TypeError(err);
  return collection;
}
function emptyCollection(whereClause) {
  return new whereClause.Collection(whereClause, function() {
    return rangeEqual("");
  }).limit(0);
}
function upperFactory(dir) {
  return dir === "next" ? function(s) {
    return s.toUpperCase();
  } : function(s) {
    return s.toLowerCase();
  };
}
function lowerFactory(dir) {
  return dir === "next" ? function(s) {
    return s.toLowerCase();
  } : function(s) {
    return s.toUpperCase();
  };
}
function nextCasing(key2, lowerKey, upperNeedle, lowerNeedle, cmp, dir) {
  var length2 = Math.min(key2.length, lowerNeedle.length);
  var llp = -1;
  for (var i = 0; i < length2; ++i) {
    var lwrKeyChar = lowerKey[i];
    if (lwrKeyChar !== lowerNeedle[i]) {
      if (cmp(key2[i], upperNeedle[i]) < 0)
        return key2.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
      if (cmp(key2[i], lowerNeedle[i]) < 0)
        return key2.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
      if (llp >= 0)
        return key2.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
      return null;
    }
    if (cmp(key2[i], lwrKeyChar) < 0)
      llp = i;
  }
  if (length2 < lowerNeedle.length && dir === "next")
    return key2 + upperNeedle.substr(key2.length);
  if (length2 < key2.length && dir === "prev")
    return key2.substr(0, upperNeedle.length);
  return llp < 0 ? null : key2.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1);
}
function addIgnoreCaseAlgorithm(whereClause, match3, needles, suffix) {
  var upper, lower, compare, upperNeedles, lowerNeedles, direction, nextKeySuffix, needlesLen = needles.length;
  if (!needles.every(function(s) {
    return typeof s === "string";
  })) {
    return fail(whereClause, STRING_EXPECTED);
  }
  function initDirection(dir) {
    upper = upperFactory(dir);
    lower = lowerFactory(dir);
    compare = dir === "next" ? simpleCompare : simpleCompareReverse;
    var needleBounds = needles.map(function(needle) {
      return {lower: lower(needle), upper: upper(needle)};
    }).sort(function(a, b) {
      return compare(a.lower, b.lower);
    });
    upperNeedles = needleBounds.map(function(nb) {
      return nb.upper;
    });
    lowerNeedles = needleBounds.map(function(nb) {
      return nb.lower;
    });
    direction = dir;
    nextKeySuffix = dir === "next" ? "" : suffix;
  }
  initDirection("next");
  var c = new whereClause.Collection(whereClause, function() {
    return createRange(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix);
  });
  c._ondirectionchange = function(direction2) {
    initDirection(direction2);
  };
  var firstPossibleNeedle = 0;
  c._addAlgorithm(function(cursor, advance, resolve) {
    var key2 = cursor.key;
    if (typeof key2 !== "string")
      return false;
    var lowerKey = lower(key2);
    if (match3(lowerKey, lowerNeedles, firstPossibleNeedle)) {
      return true;
    } else {
      var lowestPossibleCasing = null;
      for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
        var casing = nextCasing(key2, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
        if (casing === null && lowestPossibleCasing === null)
          firstPossibleNeedle = i + 1;
        else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
          lowestPossibleCasing = casing;
        }
      }
      if (lowestPossibleCasing !== null) {
        advance(function() {
          cursor.continue(lowestPossibleCasing + nextKeySuffix);
        });
      } else {
        advance(resolve);
      }
      return false;
    }
  });
  return c;
}
function createRange(lower, upper, lowerOpen, upperOpen) {
  return {
    type: 2,
    lower,
    upper,
    lowerOpen,
    upperOpen
  };
}
function rangeEqual(value) {
  return {
    type: 1,
    lower: value,
    upper: value
  };
}
var WhereClause = function() {
  function WhereClause2() {
  }
  Object.defineProperty(WhereClause2.prototype, "Collection", {
    get: function() {
      return this._ctx.table.db.Collection;
    },
    enumerable: true,
    configurable: true
  });
  WhereClause2.prototype.between = function(lower, upper, includeLower, includeUpper) {
    includeLower = includeLower !== false;
    includeUpper = includeUpper === true;
    try {
      if (this._cmp(lower, upper) > 0 || this._cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper))
        return emptyCollection(this);
      return new this.Collection(this, function() {
        return createRange(lower, upper, !includeLower, !includeUpper);
      });
    } catch (e) {
      return fail(this, INVALID_KEY_ARGUMENT);
    }
  };
  WhereClause2.prototype.equals = function(value) {
    return new this.Collection(this, function() {
      return rangeEqual(value);
    });
  };
  WhereClause2.prototype.above = function(value) {
    if (value == null)
      return fail(this, INVALID_KEY_ARGUMENT);
    return new this.Collection(this, function() {
      return createRange(value, void 0, true);
    });
  };
  WhereClause2.prototype.aboveOrEqual = function(value) {
    if (value == null)
      return fail(this, INVALID_KEY_ARGUMENT);
    return new this.Collection(this, function() {
      return createRange(value, void 0, false);
    });
  };
  WhereClause2.prototype.below = function(value) {
    if (value == null)
      return fail(this, INVALID_KEY_ARGUMENT);
    return new this.Collection(this, function() {
      return createRange(void 0, value, false, true);
    });
  };
  WhereClause2.prototype.belowOrEqual = function(value) {
    if (value == null)
      return fail(this, INVALID_KEY_ARGUMENT);
    return new this.Collection(this, function() {
      return createRange(void 0, value);
    });
  };
  WhereClause2.prototype.startsWith = function(str) {
    if (typeof str !== "string")
      return fail(this, STRING_EXPECTED);
    return this.between(str, str + maxString, true, true);
  };
  WhereClause2.prototype.startsWithIgnoreCase = function(str) {
    if (str === "")
      return this.startsWith(str);
    return addIgnoreCaseAlgorithm(this, function(x, a) {
      return x.indexOf(a[0]) === 0;
    }, [str], maxString);
  };
  WhereClause2.prototype.equalsIgnoreCase = function(str) {
    return addIgnoreCaseAlgorithm(this, function(x, a) {
      return x === a[0];
    }, [str], "");
  };
  WhereClause2.prototype.anyOfIgnoreCase = function() {
    var set5 = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
    if (set5.length === 0)
      return emptyCollection(this);
    return addIgnoreCaseAlgorithm(this, function(x, a) {
      return a.indexOf(x) !== -1;
    }, set5, "");
  };
  WhereClause2.prototype.startsWithAnyOfIgnoreCase = function() {
    var set5 = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
    if (set5.length === 0)
      return emptyCollection(this);
    return addIgnoreCaseAlgorithm(this, function(x, a) {
      return a.some(function(n) {
        return x.indexOf(n) === 0;
      });
    }, set5, maxString);
  };
  WhereClause2.prototype.anyOf = function() {
    var _this = this;
    var set5 = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
    var compare = this._cmp;
    try {
      set5.sort(compare);
    } catch (e) {
      return fail(this, INVALID_KEY_ARGUMENT);
    }
    if (set5.length === 0)
      return emptyCollection(this);
    var c = new this.Collection(this, function() {
      return createRange(set5[0], set5[set5.length - 1]);
    });
    c._ondirectionchange = function(direction) {
      compare = direction === "next" ? _this._ascending : _this._descending;
      set5.sort(compare);
    };
    var i = 0;
    c._addAlgorithm(function(cursor, advance, resolve) {
      var key2 = cursor.key;
      while (compare(key2, set5[i]) > 0) {
        ++i;
        if (i === set5.length) {
          advance(resolve);
          return false;
        }
      }
      if (compare(key2, set5[i]) === 0) {
        return true;
      } else {
        advance(function() {
          cursor.continue(set5[i]);
        });
        return false;
      }
    });
    return c;
  };
  WhereClause2.prototype.notEqual = function(value) {
    return this.inAnyRange([[minKey, value], [value, this.db._maxKey]], {includeLowers: false, includeUppers: false});
  };
  WhereClause2.prototype.noneOf = function() {
    var set5 = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
    if (set5.length === 0)
      return new this.Collection(this);
    try {
      set5.sort(this._ascending);
    } catch (e) {
      return fail(this, INVALID_KEY_ARGUMENT);
    }
    var ranges = set5.reduce(function(res, val) {
      return res ? res.concat([[res[res.length - 1][1], val]]) : [[minKey, val]];
    }, null);
    ranges.push([set5[set5.length - 1], this.db._maxKey]);
    return this.inAnyRange(ranges, {includeLowers: false, includeUppers: false});
  };
  WhereClause2.prototype.inAnyRange = function(ranges, options) {
    var _this = this;
    var cmp = this._cmp, ascending = this._ascending, descending = this._descending, min4 = this._min, max4 = this._max;
    if (ranges.length === 0)
      return emptyCollection(this);
    if (!ranges.every(function(range) {
      return range[0] !== void 0 && range[1] !== void 0 && ascending(range[0], range[1]) <= 0;
    })) {
      return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
    }
    var includeLowers = !options || options.includeLowers !== false;
    var includeUppers = options && options.includeUppers === true;
    function addRange(ranges2, newRange) {
      var i = 0, l = ranges2.length;
      for (; i < l; ++i) {
        var range = ranges2[i];
        if (cmp(newRange[0], range[1]) < 0 && cmp(newRange[1], range[0]) > 0) {
          range[0] = min4(range[0], newRange[0]);
          range[1] = max4(range[1], newRange[1]);
          break;
        }
      }
      if (i === l)
        ranges2.push(newRange);
      return ranges2;
    }
    var sortDirection = ascending;
    function rangeSorter(a, b) {
      return sortDirection(a[0], b[0]);
    }
    var set5;
    try {
      set5 = ranges.reduce(addRange, []);
      set5.sort(rangeSorter);
    } catch (ex) {
      return fail(this, INVALID_KEY_ARGUMENT);
    }
    var rangePos = 0;
    var keyIsBeyondCurrentEntry = includeUppers ? function(key2) {
      return ascending(key2, set5[rangePos][1]) > 0;
    } : function(key2) {
      return ascending(key2, set5[rangePos][1]) >= 0;
    };
    var keyIsBeforeCurrentEntry = includeLowers ? function(key2) {
      return descending(key2, set5[rangePos][0]) > 0;
    } : function(key2) {
      return descending(key2, set5[rangePos][0]) >= 0;
    };
    function keyWithinCurrentRange(key2) {
      return !keyIsBeyondCurrentEntry(key2) && !keyIsBeforeCurrentEntry(key2);
    }
    var checkKey = keyIsBeyondCurrentEntry;
    var c = new this.Collection(this, function() {
      return createRange(set5[0][0], set5[set5.length - 1][1], !includeLowers, !includeUppers);
    });
    c._ondirectionchange = function(direction) {
      if (direction === "next") {
        checkKey = keyIsBeyondCurrentEntry;
        sortDirection = ascending;
      } else {
        checkKey = keyIsBeforeCurrentEntry;
        sortDirection = descending;
      }
      set5.sort(rangeSorter);
    };
    c._addAlgorithm(function(cursor, advance, resolve) {
      var key2 = cursor.key;
      while (checkKey(key2)) {
        ++rangePos;
        if (rangePos === set5.length) {
          advance(resolve);
          return false;
        }
      }
      if (keyWithinCurrentRange(key2)) {
        return true;
      } else if (_this._cmp(key2, set5[rangePos][1]) === 0 || _this._cmp(key2, set5[rangePos][0]) === 0) {
        return false;
      } else {
        advance(function() {
          if (sortDirection === ascending)
            cursor.continue(set5[rangePos][0]);
          else
            cursor.continue(set5[rangePos][1]);
        });
        return false;
      }
    });
    return c;
  };
  WhereClause2.prototype.startsWithAnyOf = function() {
    var set5 = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
    if (!set5.every(function(s) {
      return typeof s === "string";
    })) {
      return fail(this, "startsWithAnyOf() only works with strings");
    }
    if (set5.length === 0)
      return emptyCollection(this);
    return this.inAnyRange(set5.map(function(str) {
      return [str, str + maxString];
    }));
  };
  return WhereClause2;
}();
function createWhereClauseConstructor(db) {
  return makeClassConstructor(WhereClause.prototype, function WhereClause$$1(table, index10, orCollection) {
    this.db = db;
    this._ctx = {
      table,
      index: index10 === ":id" ? null : index10,
      or: orCollection
    };
    var indexedDB = db._deps.indexedDB;
    if (!indexedDB)
      throw new exceptions.MissingAPI("indexedDB API missing");
    this._cmp = this._ascending = indexedDB.cmp.bind(indexedDB);
    this._descending = function(a, b) {
      return indexedDB.cmp(b, a);
    };
    this._max = function(a, b) {
      return indexedDB.cmp(a, b) > 0 ? a : b;
    };
    this._min = function(a, b) {
      return indexedDB.cmp(a, b) < 0 ? a : b;
    };
    this._IDBKeyRange = db._deps.IDBKeyRange;
  });
}
function safariMultiStoreFix(storeNames) {
  return storeNames.length === 1 ? storeNames[0] : storeNames;
}
function getMaxKey(IdbKeyRange) {
  try {
    IdbKeyRange.only([[]]);
    return [[]];
  } catch (e) {
    return maxString;
  }
}
function eventRejectHandler(reject) {
  return wrap(function(event) {
    preventDefault(event);
    reject(event.target.error);
    return false;
  });
}
function preventDefault(event) {
  if (event.stopPropagation)
    event.stopPropagation();
  if (event.preventDefault)
    event.preventDefault();
}
var Transaction = function() {
  function Transaction3() {
  }
  Transaction3.prototype._lock = function() {
    assert(!PSD.global);
    ++this._reculock;
    if (this._reculock === 1 && !PSD.global)
      PSD.lockOwnerFor = this;
    return this;
  };
  Transaction3.prototype._unlock = function() {
    assert(!PSD.global);
    if (--this._reculock === 0) {
      if (!PSD.global)
        PSD.lockOwnerFor = null;
      while (this._blockedFuncs.length > 0 && !this._locked()) {
        var fnAndPSD = this._blockedFuncs.shift();
        try {
          usePSD(fnAndPSD[1], fnAndPSD[0]);
        } catch (e) {
        }
      }
    }
    return this;
  };
  Transaction3.prototype._locked = function() {
    return this._reculock && PSD.lockOwnerFor !== this;
  };
  Transaction3.prototype.create = function(idbtrans) {
    var _this = this;
    if (!this.mode)
      return this;
    var idbdb = this.db.idbdb;
    var dbOpenError = this.db._state.dbOpenError;
    assert(!this.idbtrans);
    if (!idbtrans && !idbdb) {
      switch (dbOpenError && dbOpenError.name) {
        case "DatabaseClosedError":
          throw new exceptions.DatabaseClosed(dbOpenError);
        case "MissingAPIError":
          throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
        default:
          throw new exceptions.OpenFailed(dbOpenError);
      }
    }
    if (!this.active)
      throw new exceptions.TransactionInactive();
    assert(this._completion._state === null);
    idbtrans = this.idbtrans = idbtrans || idbdb.transaction(safariMultiStoreFix(this.storeNames), this.mode);
    idbtrans.onerror = wrap(function(ev) {
      preventDefault(ev);
      _this._reject(idbtrans.error);
    });
    idbtrans.onabort = wrap(function(ev) {
      preventDefault(ev);
      _this.active && _this._reject(new exceptions.Abort(idbtrans.error));
      _this.active = false;
      _this.on("abort").fire(ev);
    });
    idbtrans.oncomplete = wrap(function() {
      _this.active = false;
      _this._resolve();
    });
    return this;
  };
  Transaction3.prototype._promise = function(mode, fn, bWriteLock) {
    var _this = this;
    if (mode === "readwrite" && this.mode !== "readwrite")
      return rejection(new exceptions.ReadOnly("Transaction is readonly"));
    if (!this.active)
      return rejection(new exceptions.TransactionInactive());
    if (this._locked()) {
      return new DexiePromise(function(resolve, reject) {
        _this._blockedFuncs.push([function() {
          _this._promise(mode, fn, bWriteLock).then(resolve, reject);
        }, PSD]);
      });
    } else if (bWriteLock) {
      return newScope(function() {
        var p2 = new DexiePromise(function(resolve, reject) {
          _this._lock();
          var rv = fn(resolve, reject, _this);
          if (rv && rv.then)
            rv.then(resolve, reject);
        });
        p2.finally(function() {
          return _this._unlock();
        });
        p2._lib = true;
        return p2;
      });
    } else {
      var p = new DexiePromise(function(resolve, reject) {
        var rv = fn(resolve, reject, _this);
        if (rv && rv.then)
          rv.then(resolve, reject);
      });
      p._lib = true;
      return p;
    }
  };
  Transaction3.prototype._root = function() {
    return this.parent ? this.parent._root() : this;
  };
  Transaction3.prototype.waitFor = function(promiseLike) {
    var root = this._root();
    var promise = DexiePromise.resolve(promiseLike);
    if (root._waitingFor) {
      root._waitingFor = root._waitingFor.then(function() {
        return promise;
      });
    } else {
      root._waitingFor = promise;
      root._waitingQueue = [];
      var store = root.idbtrans.objectStore(root.storeNames[0]);
      (function spin() {
        ++root._spinCount;
        while (root._waitingQueue.length)
          root._waitingQueue.shift()();
        if (root._waitingFor)
          store.get(-Infinity).onsuccess = spin;
      })();
    }
    var currentWaitPromise = root._waitingFor;
    return new DexiePromise(function(resolve, reject) {
      promise.then(function(res) {
        return root._waitingQueue.push(wrap(resolve.bind(null, res)));
      }, function(err) {
        return root._waitingQueue.push(wrap(reject.bind(null, err)));
      }).finally(function() {
        if (root._waitingFor === currentWaitPromise) {
          root._waitingFor = null;
        }
      });
    });
  };
  Transaction3.prototype.abort = function() {
    this.active && this._reject(new exceptions.Abort());
    this.active = false;
  };
  Transaction3.prototype.table = function(tableName) {
    var memoizedTables = this._memoizedTables || (this._memoizedTables = {});
    if (hasOwn(memoizedTables, tableName))
      return memoizedTables[tableName];
    var tableSchema = this.schema[tableName];
    if (!tableSchema) {
      throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
    }
    var transactionBoundTable = new this.db.Table(tableName, tableSchema, this);
    transactionBoundTable.core = this.db.core.table(tableName);
    memoizedTables[tableName] = transactionBoundTable;
    return transactionBoundTable;
  };
  return Transaction3;
}();
function createTransactionConstructor(db) {
  return makeClassConstructor(Transaction.prototype, function Transaction$$1(mode, storeNames, dbschema, parent) {
    var _this = this;
    this.db = db;
    this.mode = mode;
    this.storeNames = storeNames;
    this.schema = dbschema;
    this.idbtrans = null;
    this.on = Events(this, "complete", "error", "abort");
    this.parent = parent || null;
    this.active = true;
    this._reculock = 0;
    this._blockedFuncs = [];
    this._resolve = null;
    this._reject = null;
    this._waitingFor = null;
    this._waitingQueue = null;
    this._spinCount = 0;
    this._completion = new DexiePromise(function(resolve, reject) {
      _this._resolve = resolve;
      _this._reject = reject;
    });
    this._completion.then(function() {
      _this.active = false;
      _this.on.complete.fire();
    }, function(e) {
      var wasActive = _this.active;
      _this.active = false;
      _this.on.error.fire(e);
      _this.parent ? _this.parent._reject(e) : wasActive && _this.idbtrans && _this.idbtrans.abort();
      return rejection(e);
    });
  });
}
function createIndexSpec(name, keyPath, unique, multi, auto, compound, isPrimKey) {
  return {
    name,
    keyPath,
    unique,
    multi,
    auto,
    compound,
    src: (unique && !isPrimKey ? "&" : "") + (multi ? "*" : "") + (auto ? "++" : "") + nameFromKeyPath(keyPath)
  };
}
function nameFromKeyPath(keyPath) {
  return typeof keyPath === "string" ? keyPath : keyPath ? "[" + [].join.call(keyPath, "+") + "]" : "";
}
function createTableSchema(name, primKey, indexes) {
  return {
    name,
    primKey,
    indexes,
    mappedClass: null,
    idxByName: arrayToObject(indexes, function(index10) {
      return [index10.name, index10];
    })
  };
}
function getKeyExtractor(keyPath) {
  if (keyPath == null) {
    return function() {
      return void 0;
    };
  } else if (typeof keyPath === "string") {
    return getSinglePathKeyExtractor(keyPath);
  } else {
    return function(obj) {
      return getByKeyPath(obj, keyPath);
    };
  }
}
function getSinglePathKeyExtractor(keyPath) {
  var split = keyPath.split(".");
  if (split.length === 1) {
    return function(obj) {
      return obj[keyPath];
    };
  } else {
    return function(obj) {
      return getByKeyPath(obj, keyPath);
    };
  }
}
function getEffectiveKeys(primaryKey, req) {
  if (req.type === "delete")
    return req.keys;
  return req.keys || req.values.map(primaryKey.extractKey);
}
function getExistingValues(table, req, effectiveKeys) {
  return req.type === "add" ? Promise.resolve(new Array(req.values.length)) : table.getMany({trans: req.trans, keys: effectiveKeys});
}
function arrayify(arrayLike) {
  return [].slice.call(arrayLike);
}
var _id_counter = 0;
function getKeyPathAlias(keyPath) {
  return keyPath == null ? ":id" : typeof keyPath === "string" ? keyPath : "[" + keyPath.join("+") + "]";
}
function createDBCore(db, indexedDB, IdbKeyRange, tmpTrans) {
  var cmp = indexedDB.cmp.bind(indexedDB);
  function extractSchema(db2, trans) {
    var tables2 = arrayify(db2.objectStoreNames);
    return {
      schema: {
        name: db2.name,
        tables: tables2.map(function(table) {
          return trans.objectStore(table);
        }).map(function(store) {
          var keyPath = store.keyPath, autoIncrement = store.autoIncrement;
          var compound = isArray(keyPath);
          var outbound = keyPath == null;
          var indexByKeyPath = {};
          var result = {
            name: store.name,
            primaryKey: {
              name: null,
              isPrimaryKey: true,
              outbound,
              compound,
              keyPath,
              autoIncrement,
              unique: true,
              extractKey: getKeyExtractor(keyPath)
            },
            indexes: arrayify(store.indexNames).map(function(indexName) {
              return store.index(indexName);
            }).map(function(index10) {
              var name = index10.name, unique = index10.unique, multiEntry = index10.multiEntry, keyPath2 = index10.keyPath;
              var compound2 = isArray(keyPath2);
              var result2 = {
                name,
                compound: compound2,
                keyPath: keyPath2,
                unique,
                multiEntry,
                extractKey: getKeyExtractor(keyPath2)
              };
              indexByKeyPath[getKeyPathAlias(keyPath2)] = result2;
              return result2;
            }),
            getIndexByKeyPath: function(keyPath2) {
              return indexByKeyPath[getKeyPathAlias(keyPath2)];
            }
          };
          indexByKeyPath[":id"] = result.primaryKey;
          if (keyPath != null) {
            indexByKeyPath[getKeyPathAlias(keyPath)] = result.primaryKey;
          }
          return result;
        })
      },
      hasGetAll: tables2.length > 0 && "getAll" in trans.objectStore(tables2[0]) && !(typeof navigator !== "undefined" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604)
    };
  }
  function makeIDBKeyRange(range) {
    if (range.type === 3)
      return null;
    if (range.type === 4)
      throw new Error("Cannot convert never type to IDBKeyRange");
    var lower = range.lower, upper = range.upper, lowerOpen = range.lowerOpen, upperOpen = range.upperOpen;
    var idbRange = lower === void 0 ? upper === void 0 ? null : IdbKeyRange.upperBound(upper, !!upperOpen) : upper === void 0 ? IdbKeyRange.lowerBound(lower, !!lowerOpen) : IdbKeyRange.bound(lower, upper, !!lowerOpen, !!upperOpen);
    return idbRange;
  }
  function createDbCoreTable(tableSchema) {
    var tableName = tableSchema.name;
    function mutate(_a3) {
      var trans = _a3.trans, type = _a3.type, keys$$1 = _a3.keys, values = _a3.values, range = _a3.range, wantResults = _a3.wantResults;
      return new Promise(function(resolve, reject) {
        resolve = wrap(resolve);
        var store = trans.objectStore(tableName);
        var outbound = store.keyPath == null;
        var isAddOrPut = type === "put" || type === "add";
        if (!isAddOrPut && type !== "delete" && type !== "deleteRange")
          throw new Error("Invalid operation type: " + type);
        var length2 = (keys$$1 || values || {length: 1}).length;
        if (keys$$1 && values && keys$$1.length !== values.length) {
          throw new Error("Given keys array must have same length as given values array.");
        }
        if (length2 === 0)
          return resolve({numFailures: 0, failures: {}, results: [], lastResult: void 0});
        var results = wantResults && __spreadArrays(keys$$1 ? keys$$1 : getEffectiveKeys(tableSchema.primaryKey, {type, keys: keys$$1, values}));
        var req;
        var failures = [];
        var numFailures = 0;
        var errorHandler = function(event) {
          ++numFailures;
          preventDefault(event);
          if (results)
            results[event.target._reqno] = void 0;
          failures[event.target._reqno] = event.target.error;
        };
        var setResult = function(_a5) {
          var target = _a5.target;
          results[target._reqno] = target.result;
        };
        if (type === "deleteRange") {
          if (range.type === 4)
            return resolve({numFailures, failures, results, lastResult: void 0});
          if (range.type === 3)
            req = store.clear();
          else
            req = store.delete(makeIDBKeyRange(range));
        } else {
          var _a4 = isAddOrPut ? outbound ? [values, keys$$1] : [values, null] : [keys$$1, null], args1 = _a4[0], args2 = _a4[1];
          if (isAddOrPut) {
            for (var i = 0; i < length2; ++i) {
              req = args2 && args2[i] !== void 0 ? store[type](args1[i], args2[i]) : store[type](args1[i]);
              req._reqno = i;
              if (results && results[i] === void 0) {
                req.onsuccess = setResult;
              }
              req.onerror = errorHandler;
            }
          } else {
            for (var i = 0; i < length2; ++i) {
              req = store[type](args1[i]);
              req._reqno = i;
              req.onerror = errorHandler;
            }
          }
        }
        var done = function(event) {
          var lastResult = event.target.result;
          if (results)
            results[length2 - 1] = lastResult;
          resolve({
            numFailures,
            failures,
            results,
            lastResult
          });
        };
        req.onerror = function(event) {
          errorHandler(event);
          done(event);
        };
        req.onsuccess = done;
      });
    }
    function openCursor2(_a3) {
      var trans = _a3.trans, values = _a3.values, query2 = _a3.query, reverse = _a3.reverse, unique = _a3.unique;
      return new Promise(function(resolve, reject) {
        resolve = wrap(resolve);
        var index10 = query2.index, range = query2.range;
        var store = trans.objectStore(tableName);
        var source = index10.isPrimaryKey ? store : store.index(index10.name);
        var direction = reverse ? unique ? "prevunique" : "prev" : unique ? "nextunique" : "next";
        var req = values || !("openKeyCursor" in source) ? source.openCursor(makeIDBKeyRange(range), direction) : source.openKeyCursor(makeIDBKeyRange(range), direction);
        req.onerror = eventRejectHandler(reject);
        req.onsuccess = wrap(function(ev) {
          var cursor = req.result;
          if (!cursor) {
            resolve(null);
            return;
          }
          cursor.___id = ++_id_counter;
          cursor.done = false;
          var _cursorContinue = cursor.continue.bind(cursor);
          var _cursorContinuePrimaryKey = cursor.continuePrimaryKey;
          if (_cursorContinuePrimaryKey)
            _cursorContinuePrimaryKey = _cursorContinuePrimaryKey.bind(cursor);
          var _cursorAdvance = cursor.advance.bind(cursor);
          var doThrowCursorIsNotStarted = function() {
            throw new Error("Cursor not started");
          };
          var doThrowCursorIsStopped = function() {
            throw new Error("Cursor not stopped");
          };
          cursor.trans = trans;
          cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsNotStarted;
          cursor.fail = wrap(reject);
          cursor.next = function() {
            var _this = this;
            var gotOne = 1;
            return this.start(function() {
              return gotOne-- ? _this.continue() : _this.stop();
            }).then(function() {
              return _this;
            });
          };
          cursor.start = function(callback) {
            var iterationPromise = new Promise(function(resolveIteration, rejectIteration) {
              resolveIteration = wrap(resolveIteration);
              req.onerror = eventRejectHandler(rejectIteration);
              cursor.fail = rejectIteration;
              cursor.stop = function(value) {
                cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsStopped;
                resolveIteration(value);
              };
            });
            var guardedCallback = function() {
              if (req.result) {
                try {
                  callback();
                } catch (err) {
                  cursor.fail(err);
                }
              } else {
                cursor.done = true;
                cursor.start = function() {
                  throw new Error("Cursor behind last entry");
                };
                cursor.stop();
              }
            };
            req.onsuccess = wrap(function(ev2) {
              req.onsuccess = guardedCallback;
              guardedCallback();
            });
            cursor.continue = _cursorContinue;
            cursor.continuePrimaryKey = _cursorContinuePrimaryKey;
            cursor.advance = _cursorAdvance;
            guardedCallback();
            return iterationPromise;
          };
          resolve(cursor);
        }, reject);
      });
    }
    function query(hasGetAll2) {
      return function(request) {
        return new Promise(function(resolve, reject) {
          resolve = wrap(resolve);
          var trans = request.trans, values = request.values, limit = request.limit, query2 = request.query;
          var nonInfinitLimit = limit === Infinity ? void 0 : limit;
          var index10 = query2.index, range = query2.range;
          var store = trans.objectStore(tableName);
          var source = index10.isPrimaryKey ? store : store.index(index10.name);
          var idbKeyRange = makeIDBKeyRange(range);
          if (limit === 0)
            return resolve({result: []});
          if (hasGetAll2) {
            var req = values ? source.getAll(idbKeyRange, nonInfinitLimit) : source.getAllKeys(idbKeyRange, nonInfinitLimit);
            req.onsuccess = function(event) {
              return resolve({result: event.target.result});
            };
            req.onerror = eventRejectHandler(reject);
          } else {
            var count_1 = 0;
            var req_1 = values || !("openKeyCursor" in source) ? source.openCursor(idbKeyRange) : source.openKeyCursor(idbKeyRange);
            var result_1 = [];
            req_1.onsuccess = function(event) {
              var cursor = req_1.result;
              if (!cursor)
                return resolve({result: result_1});
              result_1.push(values ? cursor.value : cursor.primaryKey);
              if (++count_1 === limit)
                return resolve({result: result_1});
              cursor.continue();
            };
            req_1.onerror = eventRejectHandler(reject);
          }
        });
      };
    }
    return {
      name: tableName,
      schema: tableSchema,
      mutate,
      getMany: function(_a3) {
        var trans = _a3.trans, keys$$1 = _a3.keys;
        return new Promise(function(resolve, reject) {
          resolve = wrap(resolve);
          var store = trans.objectStore(tableName);
          var length2 = keys$$1.length;
          var result = new Array(length2);
          var keyCount = 0;
          var callbackCount = 0;
          var valueCount = 0;
          var req;
          var successHandler = function(event) {
            var req2 = event.target;
            if ((result[req2._pos] = req2.result) != null)
              ++valueCount;
            if (++callbackCount === keyCount)
              resolve(result);
          };
          var errorHandler = eventRejectHandler(reject);
          for (var i = 0; i < length2; ++i) {
            var key2 = keys$$1[i];
            if (key2 != null) {
              req = store.get(keys$$1[i]);
              req._pos = i;
              req.onsuccess = successHandler;
              req.onerror = errorHandler;
              ++keyCount;
            }
          }
          if (keyCount === 0)
            resolve(result);
        });
      },
      get: function(_a3) {
        var trans = _a3.trans, key2 = _a3.key;
        return new Promise(function(resolve, reject) {
          resolve = wrap(resolve);
          var store = trans.objectStore(tableName);
          var req = store.get(key2);
          req.onsuccess = function(event) {
            return resolve(event.target.result);
          };
          req.onerror = eventRejectHandler(reject);
        });
      },
      query: query(hasGetAll),
      openCursor: openCursor2,
      count: function(_a3) {
        var query2 = _a3.query, trans = _a3.trans;
        var index10 = query2.index, range = query2.range;
        return new Promise(function(resolve, reject) {
          var store = trans.objectStore(tableName);
          var source = index10.isPrimaryKey ? store : store.index(index10.name);
          var idbKeyRange = makeIDBKeyRange(range);
          var req = idbKeyRange ? source.count(idbKeyRange) : source.count();
          req.onsuccess = wrap(function(ev) {
            return resolve(ev.target.result);
          });
          req.onerror = eventRejectHandler(reject);
        });
      }
    };
  }
  var _a2 = extractSchema(db, tmpTrans), schema = _a2.schema, hasGetAll = _a2.hasGetAll;
  var tables = schema.tables.map(function(tableSchema) {
    return createDbCoreTable(tableSchema);
  });
  var tableMap = {};
  tables.forEach(function(table) {
    return tableMap[table.name] = table;
  });
  return {
    stack: "dbcore",
    transaction: db.transaction.bind(db),
    table: function(name) {
      var result = tableMap[name];
      if (!result)
        throw new Error("Table '" + name + "' not found");
      return tableMap[name];
    },
    cmp,
    MIN_KEY: -Infinity,
    MAX_KEY: getMaxKey(IdbKeyRange),
    schema
  };
}
function createMiddlewareStack(stackImpl, middlewares) {
  return middlewares.reduce(function(down, _a2) {
    var create = _a2.create;
    return __assign(__assign({}, down), create(down));
  }, stackImpl);
}
function createMiddlewareStacks(middlewares, idbdb, _a2, tmpTrans) {
  var IDBKeyRange = _a2.IDBKeyRange, indexedDB = _a2.indexedDB;
  var dbcore = createMiddlewareStack(createDBCore(idbdb, indexedDB, IDBKeyRange, tmpTrans), middlewares.dbcore);
  return {
    dbcore
  };
}
function generateMiddlewareStacks(db, tmpTrans) {
  var idbdb = tmpTrans.db;
  var stacks = createMiddlewareStacks(db._middlewares, idbdb, db._deps, tmpTrans);
  db.core = stacks.dbcore;
  db.tables.forEach(function(table) {
    var tableName = table.name;
    if (db.core.schema.tables.some(function(tbl) {
      return tbl.name === tableName;
    })) {
      table.core = db.core.table(tableName);
      if (db[tableName] instanceof db.Table) {
        db[tableName].core = table.core;
      }
    }
  });
}
function setApiOnPlace(db, objs, tableNames, dbschema) {
  tableNames.forEach(function(tableName) {
    var schema = dbschema[tableName];
    objs.forEach(function(obj) {
      if (!(tableName in obj)) {
        if (obj === db.Transaction.prototype || obj instanceof db.Transaction) {
          setProp(obj, tableName, {
            get: function() {
              return this.table(tableName);
            },
            set: function(value) {
              defineProperty(this, tableName, {value, writable: true, configurable: true, enumerable: true});
            }
          });
        } else {
          obj[tableName] = new db.Table(tableName, schema);
        }
      }
    });
  });
}
function removeTablesApi(db, objs) {
  objs.forEach(function(obj) {
    for (var key2 in obj) {
      if (obj[key2] instanceof db.Table)
        delete obj[key2];
    }
  });
}
function lowerVersionFirst(a, b) {
  return a._cfg.version - b._cfg.version;
}
function runUpgraders(db, oldVersion, idbUpgradeTrans, reject) {
  var globalSchema = db._dbSchema;
  var trans = db._createTransaction("readwrite", db._storeNames, globalSchema);
  trans.create(idbUpgradeTrans);
  trans._completion.catch(reject);
  var rejectTransaction = trans._reject.bind(trans);
  var transless = PSD.transless || PSD;
  newScope(function() {
    PSD.trans = trans;
    PSD.transless = transless;
    if (oldVersion === 0) {
      keys(globalSchema).forEach(function(tableName) {
        createTable(idbUpgradeTrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
      });
      generateMiddlewareStacks(db, idbUpgradeTrans);
      DexiePromise.follow(function() {
        return db.on.populate.fire(trans);
      }).catch(rejectTransaction);
    } else
      updateTablesAndIndexes(db, oldVersion, trans, idbUpgradeTrans).catch(rejectTransaction);
  });
}
function updateTablesAndIndexes(db, oldVersion, trans, idbUpgradeTrans) {
  var queue = [];
  var versions = db._versions;
  var globalSchema = db._dbSchema = buildGlobalSchema(db, db.idbdb, idbUpgradeTrans);
  var anyContentUpgraderHasRun = false;
  var versToRun = versions.filter(function(v) {
    return v._cfg.version >= oldVersion;
  });
  versToRun.forEach(function(version) {
    queue.push(function() {
      var oldSchema = globalSchema;
      var newSchema = version._cfg.dbschema;
      adjustToExistingIndexNames(db, oldSchema, idbUpgradeTrans);
      adjustToExistingIndexNames(db, newSchema, idbUpgradeTrans);
      globalSchema = db._dbSchema = newSchema;
      var diff = getSchemaDiff(oldSchema, newSchema);
      diff.add.forEach(function(tuple) {
        createTable(idbUpgradeTrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
      });
      diff.change.forEach(function(change) {
        if (change.recreate) {
          throw new exceptions.Upgrade("Not yet support for changing primary key");
        } else {
          var store_1 = idbUpgradeTrans.objectStore(change.name);
          change.add.forEach(function(idx) {
            return addIndex(store_1, idx);
          });
          change.change.forEach(function(idx) {
            store_1.deleteIndex(idx.name);
            addIndex(store_1, idx);
          });
          change.del.forEach(function(idxName) {
            return store_1.deleteIndex(idxName);
          });
        }
      });
      var contentUpgrade = version._cfg.contentUpgrade;
      if (contentUpgrade && version._cfg.version > oldVersion) {
        generateMiddlewareStacks(db, idbUpgradeTrans);
        anyContentUpgraderHasRun = true;
        var upgradeSchema_1 = shallowClone(newSchema);
        diff.del.forEach(function(table) {
          upgradeSchema_1[table] = oldSchema[table];
        });
        removeTablesApi(db, [db.Transaction.prototype]);
        setApiOnPlace(db, [db.Transaction.prototype], keys(upgradeSchema_1), upgradeSchema_1);
        trans.schema = upgradeSchema_1;
        var contentUpgradeIsAsync_1 = isAsyncFunction(contentUpgrade);
        if (contentUpgradeIsAsync_1) {
          incrementExpectedAwaits();
        }
        var returnValue_1;
        var promiseFollowed = DexiePromise.follow(function() {
          returnValue_1 = contentUpgrade(trans);
          if (returnValue_1) {
            if (contentUpgradeIsAsync_1) {
              var decrementor = decrementExpectedAwaits.bind(null, null);
              returnValue_1.then(decrementor, decrementor);
            }
          }
        });
        return returnValue_1 && typeof returnValue_1.then === "function" ? DexiePromise.resolve(returnValue_1) : promiseFollowed.then(function() {
          return returnValue_1;
        });
      }
    });
    queue.push(function(idbtrans) {
      if (!anyContentUpgraderHasRun || !hasIEDeleteObjectStoreBug) {
        var newSchema = version._cfg.dbschema;
        deleteRemovedTables(newSchema, idbtrans);
      }
      removeTablesApi(db, [db.Transaction.prototype]);
      setApiOnPlace(db, [db.Transaction.prototype], db._storeNames, db._dbSchema);
      trans.schema = db._dbSchema;
    });
  });
  function runQueue() {
    return queue.length ? DexiePromise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) : DexiePromise.resolve();
  }
  return runQueue().then(function() {
    createMissingTables(globalSchema, idbUpgradeTrans);
  });
}
function getSchemaDiff(oldSchema, newSchema) {
  var diff = {
    del: [],
    add: [],
    change: []
  };
  var table;
  for (table in oldSchema) {
    if (!newSchema[table])
      diff.del.push(table);
  }
  for (table in newSchema) {
    var oldDef = oldSchema[table], newDef = newSchema[table];
    if (!oldDef) {
      diff.add.push([table, newDef]);
    } else {
      var change = {
        name: table,
        def: newDef,
        recreate: false,
        del: [],
        add: [],
        change: []
      };
      if (oldDef.primKey.src !== newDef.primKey.src && !isIEOrEdge) {
        change.recreate = true;
        diff.change.push(change);
      } else {
        var oldIndexes = oldDef.idxByName;
        var newIndexes = newDef.idxByName;
        var idxName = void 0;
        for (idxName in oldIndexes) {
          if (!newIndexes[idxName])
            change.del.push(idxName);
        }
        for (idxName in newIndexes) {
          var oldIdx = oldIndexes[idxName], newIdx = newIndexes[idxName];
          if (!oldIdx)
            change.add.push(newIdx);
          else if (oldIdx.src !== newIdx.src)
            change.change.push(newIdx);
        }
        if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
          diff.change.push(change);
        }
      }
    }
  }
  return diff;
}
function createTable(idbtrans, tableName, primKey, indexes) {
  var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? {keyPath: primKey.keyPath, autoIncrement: primKey.auto} : {autoIncrement: primKey.auto});
  indexes.forEach(function(idx) {
    return addIndex(store, idx);
  });
  return store;
}
function createMissingTables(newSchema, idbtrans) {
  keys(newSchema).forEach(function(tableName) {
    if (!idbtrans.db.objectStoreNames.contains(tableName)) {
      createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
    }
  });
}
function deleteRemovedTables(newSchema, idbtrans) {
  for (var i = 0; i < idbtrans.db.objectStoreNames.length; ++i) {
    var storeName = idbtrans.db.objectStoreNames[i];
    if (newSchema[storeName] == null) {
      idbtrans.db.deleteObjectStore(storeName);
    }
  }
}
function addIndex(store, idx) {
  store.createIndex(idx.name, idx.keyPath, {unique: idx.unique, multiEntry: idx.multi});
}
function buildGlobalSchema(db, idbdb, tmpTrans) {
  var globalSchema = {};
  var dbStoreNames = slice(idbdb.objectStoreNames, 0);
  dbStoreNames.forEach(function(storeName) {
    var store = tmpTrans.objectStore(storeName);
    var keyPath = store.keyPath;
    var primKey = createIndexSpec(nameFromKeyPath(keyPath), keyPath || "", false, false, !!store.autoIncrement, keyPath && typeof keyPath !== "string", true);
    var indexes = [];
    for (var j = 0; j < store.indexNames.length; ++j) {
      var idbindex = store.index(store.indexNames[j]);
      keyPath = idbindex.keyPath;
      var index10 = createIndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== "string", false);
      indexes.push(index10);
    }
    globalSchema[storeName] = createTableSchema(storeName, primKey, indexes);
  });
  return globalSchema;
}
function readGlobalSchema(db, idbdb, tmpTrans) {
  db.verno = idbdb.version / 10;
  var globalSchema = db._dbSchema = buildGlobalSchema(db, idbdb, tmpTrans);
  db._storeNames = slice(idbdb.objectStoreNames, 0);
  setApiOnPlace(db, [db._allTables], keys(globalSchema), globalSchema);
}
function adjustToExistingIndexNames(db, schema, idbtrans) {
  var storeNames = idbtrans.db.objectStoreNames;
  for (var i = 0; i < storeNames.length; ++i) {
    var storeName = storeNames[i];
    var store = idbtrans.objectStore(storeName);
    db._hasGetAll = "getAll" in store;
    for (var j = 0; j < store.indexNames.length; ++j) {
      var indexName = store.indexNames[j];
      var keyPath = store.index(indexName).keyPath;
      var dexieName = typeof keyPath === "string" ? keyPath : "[" + slice(keyPath).join("+") + "]";
      if (schema[storeName]) {
        var indexSpec = schema[storeName].idxByName[dexieName];
        if (indexSpec) {
          indexSpec.name = indexName;
          delete schema[storeName].idxByName[dexieName];
          schema[storeName].idxByName[indexName] = indexSpec;
        }
      }
    }
  }
  if (typeof navigator !== "undefined" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && _global.WorkerGlobalScope && _global instanceof _global.WorkerGlobalScope && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) {
    db._hasGetAll = false;
  }
}
function parseIndexSyntax(primKeyAndIndexes) {
  return primKeyAndIndexes.split(",").map(function(index10, indexNum) {
    index10 = index10.trim();
    var name = index10.replace(/([&*]|\+\+)/g, "");
    var keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split("+") : name;
    return createIndexSpec(name, keyPath || null, /\&/.test(index10), /\*/.test(index10), /\+\+/.test(index10), isArray(keyPath), indexNum === 0);
  });
}
var Version = function() {
  function Version2() {
  }
  Version2.prototype._parseStoresSpec = function(stores, outSchema) {
    keys(stores).forEach(function(tableName) {
      if (stores[tableName] !== null) {
        var indexes = parseIndexSyntax(stores[tableName]);
        var primKey = indexes.shift();
        if (primKey.multi)
          throw new exceptions.Schema("Primary key cannot be multi-valued");
        indexes.forEach(function(idx) {
          if (idx.auto)
            throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
          if (!idx.keyPath)
            throw new exceptions.Schema("Index must have a name and cannot be an empty string");
        });
        outSchema[tableName] = createTableSchema(tableName, primKey, indexes);
      }
    });
  };
  Version2.prototype.stores = function(stores) {
    var db = this.db;
    this._cfg.storesSource = this._cfg.storesSource ? extend(this._cfg.storesSource, stores) : stores;
    var versions = db._versions;
    var storesSpec = {};
    var dbschema = {};
    versions.forEach(function(version) {
      extend(storesSpec, version._cfg.storesSource);
      dbschema = version._cfg.dbschema = {};
      version._parseStoresSpec(storesSpec, dbschema);
    });
    db._dbSchema = dbschema;
    removeTablesApi(db, [db._allTables, db, db.Transaction.prototype]);
    setApiOnPlace(db, [db._allTables, db, db.Transaction.prototype, this._cfg.tables], keys(dbschema), dbschema);
    db._storeNames = keys(dbschema);
    return this;
  };
  Version2.prototype.upgrade = function(upgradeFunction) {
    this._cfg.contentUpgrade = upgradeFunction;
    return this;
  };
  return Version2;
}();
function createVersionConstructor(db) {
  return makeClassConstructor(Version.prototype, function Version$$1(versionNumber) {
    this.db = db;
    this._cfg = {
      version: versionNumber,
      storesSource: null,
      dbschema: {},
      tables: {},
      contentUpgrade: null
    };
  });
}
var databaseEnumerator;
function DatabaseEnumerator(indexedDB) {
  var hasDatabasesNative = indexedDB && typeof indexedDB.databases === "function";
  var dbNamesTable;
  if (!hasDatabasesNative) {
    var db = new Dexie(DBNAMES_DB, {addons: []});
    db.version(1).stores({dbnames: "name"});
    dbNamesTable = db.table("dbnames");
  }
  return {
    getDatabaseNames: function() {
      return hasDatabasesNative ? DexiePromise.resolve(indexedDB.databases()).then(function(infos) {
        return infos.map(function(info) {
          return info.name;
        }).filter(function(name) {
          return name !== DBNAMES_DB;
        });
      }) : dbNamesTable.toCollection().primaryKeys();
    },
    add: function(name) {
      return !hasDatabasesNative && name !== DBNAMES_DB && dbNamesTable.put({name}).catch(nop);
    },
    remove: function(name) {
      return !hasDatabasesNative && name !== DBNAMES_DB && dbNamesTable.delete(name).catch(nop);
    }
  };
}
function initDatabaseEnumerator(indexedDB) {
  try {
    databaseEnumerator = DatabaseEnumerator(indexedDB);
  } catch (e) {
  }
}
function vip(fn) {
  return newScope(function() {
    PSD.letThrough = true;
    return fn();
  });
}
function dexieOpen(db) {
  var state = db._state;
  var indexedDB = db._deps.indexedDB;
  if (state.isBeingOpened || db.idbdb)
    return state.dbReadyPromise.then(function() {
      return state.dbOpenError ? rejection(state.dbOpenError) : db;
    });
  debug && (state.openCanceller._stackHolder = getErrorWithStack());
  state.isBeingOpened = true;
  state.dbOpenError = null;
  state.openComplete = false;
  var resolveDbReady = state.dbReadyResolve, upgradeTransaction = null;
  return DexiePromise.race([state.openCanceller, new DexiePromise(function(resolve, reject) {
    if (!indexedDB)
      throw new exceptions.MissingAPI("indexedDB API not found. If using IE10+, make sure to run your code on a server URL (not locally). If using old Safari versions, make sure to include indexedDB polyfill.");
    var dbName = db.name;
    var req = state.autoSchema ? indexedDB.open(dbName) : indexedDB.open(dbName, Math.round(db.verno * 10));
    if (!req)
      throw new exceptions.MissingAPI("IndexedDB API not available");
    req.onerror = eventRejectHandler(reject);
    req.onblocked = wrap(db._fireOnBlocked);
    req.onupgradeneeded = wrap(function(e) {
      upgradeTransaction = req.transaction;
      if (state.autoSchema && !db._options.allowEmptyDB) {
        req.onerror = preventDefault;
        upgradeTransaction.abort();
        req.result.close();
        var delreq = indexedDB.deleteDatabase(dbName);
        delreq.onsuccess = delreq.onerror = wrap(function() {
          reject(new exceptions.NoSuchDatabase("Database " + dbName + " doesnt exist"));
        });
      } else {
        upgradeTransaction.onerror = eventRejectHandler(reject);
        var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion;
        db.idbdb = req.result;
        runUpgraders(db, oldVer / 10, upgradeTransaction, reject);
      }
    }, reject);
    req.onsuccess = wrap(function() {
      upgradeTransaction = null;
      var idbdb = db.idbdb = req.result;
      var objectStoreNames = slice(idbdb.objectStoreNames);
      if (objectStoreNames.length > 0)
        try {
          var tmpTrans = idbdb.transaction(safariMultiStoreFix(objectStoreNames), "readonly");
          if (state.autoSchema)
            readGlobalSchema(db, idbdb, tmpTrans);
          else
            adjustToExistingIndexNames(db, db._dbSchema, tmpTrans);
          generateMiddlewareStacks(db, tmpTrans);
        } catch (e) {
        }
      connections.push(db);
      idbdb.onversionchange = wrap(function(ev) {
        state.vcFired = true;
        db.on("versionchange").fire(ev);
      });
      databaseEnumerator.add(dbName);
      resolve();
    }, reject);
  })]).then(function() {
    state.onReadyBeingFired = [];
    return DexiePromise.resolve(vip(db.on.ready.fire)).then(function fireRemainders() {
      if (state.onReadyBeingFired.length > 0) {
        var remainders = state.onReadyBeingFired.reduce(promisableChain, nop);
        state.onReadyBeingFired = [];
        return DexiePromise.resolve(vip(remainders)).then(fireRemainders);
      }
    });
  }).finally(function() {
    state.onReadyBeingFired = null;
  }).then(function() {
    state.isBeingOpened = false;
    return db;
  }).catch(function(err) {
    try {
      upgradeTransaction && upgradeTransaction.abort();
    } catch (e) {
    }
    state.isBeingOpened = false;
    db.close();
    state.dbOpenError = err;
    return rejection(state.dbOpenError);
  }).finally(function() {
    state.openComplete = true;
    resolveDbReady();
  });
}
function awaitIterator(iterator) {
  var callNext = function(result) {
    return iterator.next(result);
  }, doThrow = function(error) {
    return iterator.throw(error);
  }, onSuccess = step(callNext), onError = step(doThrow);
  function step(getNext) {
    return function(val) {
      var next = getNext(val), value = next.value;
      return next.done ? value : !value || typeof value.then !== "function" ? isArray(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) : value.then(onSuccess, onError);
    };
  }
  return step(callNext)();
}
function extractTransactionArgs(mode, _tableArgs_, scopeFunc) {
  var i = arguments.length;
  if (i < 2)
    throw new exceptions.InvalidArgument("Too few arguments");
  var args = new Array(i - 1);
  while (--i)
    args[i - 1] = arguments[i];
  scopeFunc = args.pop();
  var tables = flatten(args);
  return [mode, tables, scopeFunc];
}
function enterTransactionScope(db, mode, storeNames, parentTransaction, scopeFunc) {
  return DexiePromise.resolve().then(function() {
    var transless = PSD.transless || PSD;
    var trans = db._createTransaction(mode, storeNames, db._dbSchema, parentTransaction);
    var zoneProps = {
      trans,
      transless
    };
    if (parentTransaction) {
      trans.idbtrans = parentTransaction.idbtrans;
    } else {
      trans.create();
    }
    var scopeFuncIsAsync = isAsyncFunction(scopeFunc);
    if (scopeFuncIsAsync) {
      incrementExpectedAwaits();
    }
    var returnValue;
    var promiseFollowed = DexiePromise.follow(function() {
      returnValue = scopeFunc.call(trans, trans);
      if (returnValue) {
        if (scopeFuncIsAsync) {
          var decrementor = decrementExpectedAwaits.bind(null, null);
          returnValue.then(decrementor, decrementor);
        } else if (typeof returnValue.next === "function" && typeof returnValue.throw === "function") {
          returnValue = awaitIterator(returnValue);
        }
      }
    }, zoneProps);
    return (returnValue && typeof returnValue.then === "function" ? DexiePromise.resolve(returnValue).then(function(x) {
      return trans.active ? x : rejection(new exceptions.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
    }) : promiseFollowed.then(function() {
      return returnValue;
    })).then(function(x) {
      if (parentTransaction)
        trans._resolve();
      return trans._completion.then(function() {
        return x;
      });
    }).catch(function(e) {
      trans._reject(e);
      return rejection(e);
    });
  });
}
function pad(a, value, count) {
  var result = isArray(a) ? a.slice() : [a];
  for (var i = 0; i < count; ++i)
    result.push(value);
  return result;
}
function createVirtualIndexMiddleware(down) {
  return __assign(__assign({}, down), {table: function(tableName) {
    var table = down.table(tableName);
    var schema = table.schema;
    var indexLookup = {};
    var allVirtualIndexes = [];
    function addVirtualIndexes(keyPath, keyTail, lowLevelIndex) {
      var keyPathAlias = getKeyPathAlias(keyPath);
      var indexList = indexLookup[keyPathAlias] = indexLookup[keyPathAlias] || [];
      var keyLength = keyPath == null ? 0 : typeof keyPath === "string" ? 1 : keyPath.length;
      var isVirtual = keyTail > 0;
      var virtualIndex = __assign(__assign({}, lowLevelIndex), {
        isVirtual,
        isPrimaryKey: !isVirtual && lowLevelIndex.isPrimaryKey,
        keyTail,
        keyLength,
        extractKey: getKeyExtractor(keyPath),
        unique: !isVirtual && lowLevelIndex.unique
      });
      indexList.push(virtualIndex);
      if (!virtualIndex.isPrimaryKey) {
        allVirtualIndexes.push(virtualIndex);
      }
      if (keyLength > 1) {
        var virtualKeyPath = keyLength === 2 ? keyPath[0] : keyPath.slice(0, keyLength - 1);
        addVirtualIndexes(virtualKeyPath, keyTail + 1, lowLevelIndex);
      }
      indexList.sort(function(a, b) {
        return a.keyTail - b.keyTail;
      });
      return virtualIndex;
    }
    var primaryKey = addVirtualIndexes(schema.primaryKey.keyPath, 0, schema.primaryKey);
    indexLookup[":id"] = [primaryKey];
    for (var _i = 0, _a2 = schema.indexes; _i < _a2.length; _i++) {
      var index10 = _a2[_i];
      addVirtualIndexes(index10.keyPath, 0, index10);
    }
    function findBestIndex(keyPath) {
      var result2 = indexLookup[getKeyPathAlias(keyPath)];
      return result2 && result2[0];
    }
    function translateRange(range, keyTail) {
      return {
        type: range.type === 1 ? 2 : range.type,
        lower: pad(range.lower, range.lowerOpen ? down.MAX_KEY : down.MIN_KEY, keyTail),
        lowerOpen: true,
        upper: pad(range.upper, range.upperOpen ? down.MIN_KEY : down.MAX_KEY, keyTail),
        upperOpen: true
      };
    }
    function translateRequest(req) {
      var index11 = req.query.index;
      return index11.isVirtual ? __assign(__assign({}, req), {query: {
        index: index11,
        range: translateRange(req.query.range, index11.keyTail)
      }}) : req;
    }
    var result = __assign(__assign({}, table), {
      schema: __assign(__assign({}, schema), {primaryKey, indexes: allVirtualIndexes, getIndexByKeyPath: findBestIndex}),
      count: function(req) {
        return table.count(translateRequest(req));
      },
      query: function(req) {
        return table.query(translateRequest(req));
      },
      openCursor: function(req) {
        var _a3 = req.query.index, keyTail = _a3.keyTail, isVirtual = _a3.isVirtual, keyLength = _a3.keyLength;
        if (!isVirtual)
          return table.openCursor(req);
        function createVirtualCursor(cursor) {
          function _continue(key2) {
            key2 != null ? cursor.continue(pad(key2, req.reverse ? down.MAX_KEY : down.MIN_KEY, keyTail)) : req.unique ? cursor.continue(pad(cursor.key, req.reverse ? down.MIN_KEY : down.MAX_KEY, keyTail)) : cursor.continue();
          }
          var virtualCursor = Object.create(cursor, {
            continue: {value: _continue},
            continuePrimaryKey: {
              value: function(key2, primaryKey2) {
                cursor.continuePrimaryKey(pad(key2, down.MAX_KEY, keyTail), primaryKey2);
              }
            },
            key: {
              get: function() {
                var key2 = cursor.key;
                return keyLength === 1 ? key2[0] : key2.slice(0, keyLength);
              }
            },
            value: {
              get: function() {
                return cursor.value;
              }
            }
          });
          return virtualCursor;
        }
        return table.openCursor(translateRequest(req)).then(function(cursor) {
          return cursor && createVirtualCursor(cursor);
        });
      }
    });
    return result;
  }});
}
var virtualIndexMiddleware = {
  stack: "dbcore",
  name: "VirtualIndexMiddleware",
  level: 1,
  create: createVirtualIndexMiddleware
};
var hooksMiddleware = {
  stack: "dbcore",
  name: "HooksMiddleware",
  level: 2,
  create: function(downCore) {
    return __assign(__assign({}, downCore), {table: function(tableName) {
      var downTable = downCore.table(tableName);
      var primaryKey = downTable.schema.primaryKey;
      var tableMiddleware = __assign(__assign({}, downTable), {mutate: function(req) {
        var dxTrans = PSD.trans;
        var _a2 = dxTrans.table(tableName).hook, deleting = _a2.deleting, creating = _a2.creating, updating = _a2.updating;
        switch (req.type) {
          case "add":
            if (creating.fire === nop)
              break;
            return dxTrans._promise("readwrite", function() {
              return addPutOrDelete(req);
            }, true);
          case "put":
            if (creating.fire === nop && updating.fire === nop)
              break;
            return dxTrans._promise("readwrite", function() {
              return addPutOrDelete(req);
            }, true);
          case "delete":
            if (deleting.fire === nop)
              break;
            return dxTrans._promise("readwrite", function() {
              return addPutOrDelete(req);
            }, true);
          case "deleteRange":
            if (deleting.fire === nop)
              break;
            return dxTrans._promise("readwrite", function() {
              return deleteRange(req);
            }, true);
        }
        return downTable.mutate(req);
        function addPutOrDelete(req2) {
          var dxTrans2 = PSD.trans;
          var keys$$1 = req2.keys || getEffectiveKeys(primaryKey, req2);
          if (!keys$$1)
            throw new Error("Keys missing");
          req2 = req2.type === "add" || req2.type === "put" ? __assign(__assign({}, req2), {keys: keys$$1, wantResults: true}) : __assign({}, req2);
          if (req2.type !== "delete")
            req2.values = __spreadArrays(req2.values);
          if (req2.keys)
            req2.keys = __spreadArrays(req2.keys);
          return getExistingValues(downTable, req2, keys$$1).then(function(existingValues) {
            var contexts = keys$$1.map(function(key2, i) {
              var existingValue = existingValues[i];
              var ctx = {onerror: null, onsuccess: null};
              if (req2.type === "delete") {
                deleting.fire.call(ctx, key2, existingValue, dxTrans2);
              } else if (req2.type === "add" || existingValue === void 0) {
                var generatedPrimaryKey = creating.fire.call(ctx, key2, req2.values[i], dxTrans2);
                if (key2 == null && generatedPrimaryKey != null) {
                  key2 = generatedPrimaryKey;
                  req2.keys[i] = key2;
                  if (!primaryKey.outbound) {
                    setByKeyPath(req2.values[i], primaryKey.keyPath, key2);
                  }
                }
              } else {
                var objectDiff = getObjectDiff(existingValue, req2.values[i]);
                var additionalChanges_1 = updating.fire.call(ctx, objectDiff, key2, existingValue, dxTrans2);
                if (additionalChanges_1) {
                  var requestedValue_1 = req2.values[i];
                  Object.keys(additionalChanges_1).forEach(function(keyPath) {
                    setByKeyPath(requestedValue_1, keyPath, additionalChanges_1[keyPath]);
                  });
                }
              }
              return ctx;
            });
            return downTable.mutate(req2).then(function(_a3) {
              var failures = _a3.failures, results = _a3.results, numFailures = _a3.numFailures, lastResult = _a3.lastResult;
              for (var i = 0; i < keys$$1.length; ++i) {
                var primKey = results ? results[i] : keys$$1[i];
                var ctx = contexts[i];
                if (primKey == null) {
                  ctx.onerror && ctx.onerror(failures[i]);
                } else {
                  ctx.onsuccess && ctx.onsuccess(req2.type === "put" && existingValues[i] ? req2.values[i] : primKey);
                }
              }
              return {failures, results, numFailures, lastResult};
            }).catch(function(error) {
              contexts.forEach(function(ctx) {
                return ctx.onerror && ctx.onerror(error);
              });
              return Promise.reject(error);
            });
          });
        }
        function deleteRange(req2) {
          return deleteNextChunk(req2.trans, req2.range, 1e4);
        }
        function deleteNextChunk(trans, range, limit) {
          return downTable.query({trans, values: false, query: {index: primaryKey, range}, limit}).then(function(_a3) {
            var result = _a3.result;
            return addPutOrDelete({type: "delete", keys: result, trans}).then(function(res) {
              if (res.numFailures > 0)
                return Promise.reject(res.failures[0]);
              if (result.length < limit) {
                return {failures: [], numFailures: 0, lastResult: void 0};
              } else {
                return deleteNextChunk(trans, __assign(__assign({}, range), {lower: result[result.length - 1], lowerOpen: true}), limit);
              }
            });
          });
        }
      }});
      return tableMiddleware;
    }});
  }
};
var Dexie = function() {
  function Dexie5(name, options) {
    var _this = this;
    this._middlewares = {};
    this.verno = 0;
    var deps = Dexie5.dependencies;
    this._options = options = __assign({
      addons: Dexie5.addons,
      autoOpen: true,
      indexedDB: deps.indexedDB,
      IDBKeyRange: deps.IDBKeyRange
    }, options);
    this._deps = {
      indexedDB: options.indexedDB,
      IDBKeyRange: options.IDBKeyRange
    };
    var addons = options.addons;
    this._dbSchema = {};
    this._versions = [];
    this._storeNames = [];
    this._allTables = {};
    this.idbdb = null;
    var state = {
      dbOpenError: null,
      isBeingOpened: false,
      onReadyBeingFired: null,
      openComplete: false,
      dbReadyResolve: nop,
      dbReadyPromise: null,
      cancelOpen: nop,
      openCanceller: null,
      autoSchema: true
    };
    state.dbReadyPromise = new DexiePromise(function(resolve) {
      state.dbReadyResolve = resolve;
    });
    state.openCanceller = new DexiePromise(function(_23, reject) {
      state.cancelOpen = reject;
    });
    this._state = state;
    this.name = name;
    this.on = Events(this, "populate", "blocked", "versionchange", {ready: [promisableChain, nop]});
    this.on.ready.subscribe = override(this.on.ready.subscribe, function(subscribe) {
      return function(subscriber, bSticky) {
        Dexie5.vip(function() {
          var state2 = _this._state;
          if (state2.openComplete) {
            if (!state2.dbOpenError)
              DexiePromise.resolve().then(subscriber);
            if (bSticky)
              subscribe(subscriber);
          } else if (state2.onReadyBeingFired) {
            state2.onReadyBeingFired.push(subscriber);
            if (bSticky)
              subscribe(subscriber);
          } else {
            subscribe(subscriber);
            var db_1 = _this;
            if (!bSticky)
              subscribe(function unsubscribe() {
                db_1.on.ready.unsubscribe(subscriber);
                db_1.on.ready.unsubscribe(unsubscribe);
              });
          }
        });
      };
    });
    this.Collection = createCollectionConstructor(this);
    this.Table = createTableConstructor(this);
    this.Transaction = createTransactionConstructor(this);
    this.Version = createVersionConstructor(this);
    this.WhereClause = createWhereClauseConstructor(this);
    this.on("versionchange", function(ev) {
      if (ev.newVersion > 0)
        console.warn("Another connection wants to upgrade database '" + _this.name + "'. Closing db now to resume the upgrade.");
      else
        console.warn("Another connection wants to delete database '" + _this.name + "'. Closing db now to resume the delete request.");
      _this.close();
    });
    this.on("blocked", function(ev) {
      if (!ev.newVersion || ev.newVersion < ev.oldVersion)
        console.warn("Dexie.delete('" + _this.name + "') was blocked");
      else
        console.warn("Upgrade '" + _this.name + "' blocked by other connection holding version " + ev.oldVersion / 10);
    });
    this._maxKey = getMaxKey(options.IDBKeyRange);
    this._createTransaction = function(mode, storeNames, dbschema, parentTransaction) {
      return new _this.Transaction(mode, storeNames, dbschema, parentTransaction);
    };
    this._fireOnBlocked = function(ev) {
      _this.on("blocked").fire(ev);
      connections.filter(function(c) {
        return c.name === _this.name && c !== _this && !c._state.vcFired;
      }).map(function(c) {
        return c.on("versionchange").fire(ev);
      });
    };
    this.use(virtualIndexMiddleware);
    this.use(hooksMiddleware);
    addons.forEach(function(addon) {
      return addon(_this);
    });
  }
  Dexie5.prototype.version = function(versionNumber) {
    if (isNaN(versionNumber) || versionNumber < 0.1)
      throw new exceptions.Type("Given version is not a positive number");
    versionNumber = Math.round(versionNumber * 10) / 10;
    if (this.idbdb || this._state.isBeingOpened)
      throw new exceptions.Schema("Cannot add version when database is open");
    this.verno = Math.max(this.verno, versionNumber);
    var versions = this._versions;
    var versionInstance = versions.filter(function(v) {
      return v._cfg.version === versionNumber;
    })[0];
    if (versionInstance)
      return versionInstance;
    versionInstance = new this.Version(versionNumber);
    versions.push(versionInstance);
    versions.sort(lowerVersionFirst);
    versionInstance.stores({});
    this._state.autoSchema = false;
    return versionInstance;
  };
  Dexie5.prototype._whenReady = function(fn) {
    var _this = this;
    return this._state.openComplete || PSD.letThrough ? fn() : new DexiePromise(function(resolve, reject) {
      if (!_this._state.isBeingOpened) {
        if (!_this._options.autoOpen) {
          reject(new exceptions.DatabaseClosed());
          return;
        }
        _this.open().catch(nop);
      }
      _this._state.dbReadyPromise.then(resolve, reject);
    }).then(fn);
  };
  Dexie5.prototype.use = function(_a2) {
    var stack = _a2.stack, create = _a2.create, level = _a2.level, name = _a2.name;
    if (name)
      this.unuse({stack, name});
    var middlewares = this._middlewares[stack] || (this._middlewares[stack] = []);
    middlewares.push({stack, create, level: level == null ? 10 : level, name});
    middlewares.sort(function(a, b) {
      return a.level - b.level;
    });
    return this;
  };
  Dexie5.prototype.unuse = function(_a2) {
    var stack = _a2.stack, name = _a2.name, create = _a2.create;
    if (stack && this._middlewares[stack]) {
      this._middlewares[stack] = this._middlewares[stack].filter(function(mw) {
        return create ? mw.create !== create : name ? mw.name !== name : false;
      });
    }
    return this;
  };
  Dexie5.prototype.open = function() {
    return dexieOpen(this);
  };
  Dexie5.prototype.close = function() {
    var idx = connections.indexOf(this), state = this._state;
    if (idx >= 0)
      connections.splice(idx, 1);
    if (this.idbdb) {
      try {
        this.idbdb.close();
      } catch (e) {
      }
      this.idbdb = null;
    }
    this._options.autoOpen = false;
    state.dbOpenError = new exceptions.DatabaseClosed();
    if (state.isBeingOpened)
      state.cancelOpen(state.dbOpenError);
    state.dbReadyPromise = new DexiePromise(function(resolve) {
      state.dbReadyResolve = resolve;
    });
    state.openCanceller = new DexiePromise(function(_23, reject) {
      state.cancelOpen = reject;
    });
  };
  Dexie5.prototype.delete = function() {
    var _this = this;
    var hasArguments = arguments.length > 0;
    var state = this._state;
    return new DexiePromise(function(resolve, reject) {
      var doDelete = function() {
        _this.close();
        var req = _this._deps.indexedDB.deleteDatabase(_this.name);
        req.onsuccess = wrap(function() {
          databaseEnumerator.remove(_this.name);
          resolve();
        });
        req.onerror = eventRejectHandler(reject);
        req.onblocked = _this._fireOnBlocked;
      };
      if (hasArguments)
        throw new exceptions.InvalidArgument("Arguments not allowed in db.delete()");
      if (state.isBeingOpened) {
        state.dbReadyPromise.then(doDelete);
      } else {
        doDelete();
      }
    });
  };
  Dexie5.prototype.backendDB = function() {
    return this.idbdb;
  };
  Dexie5.prototype.isOpen = function() {
    return this.idbdb !== null;
  };
  Dexie5.prototype.hasBeenClosed = function() {
    var dbOpenError = this._state.dbOpenError;
    return dbOpenError && dbOpenError.name === "DatabaseClosed";
  };
  Dexie5.prototype.hasFailed = function() {
    return this._state.dbOpenError !== null;
  };
  Dexie5.prototype.dynamicallyOpened = function() {
    return this._state.autoSchema;
  };
  Object.defineProperty(Dexie5.prototype, "tables", {
    get: function() {
      var _this = this;
      return keys(this._allTables).map(function(name) {
        return _this._allTables[name];
      });
    },
    enumerable: true,
    configurable: true
  });
  Dexie5.prototype.transaction = function() {
    var args = extractTransactionArgs.apply(this, arguments);
    return this._transaction.apply(this, args);
  };
  Dexie5.prototype._transaction = function(mode, tables, scopeFunc) {
    var _this = this;
    var parentTransaction = PSD.trans;
    if (!parentTransaction || parentTransaction.db !== this || mode.indexOf("!") !== -1)
      parentTransaction = null;
    var onlyIfCompatible = mode.indexOf("?") !== -1;
    mode = mode.replace("!", "").replace("?", "");
    var idbMode, storeNames;
    try {
      storeNames = tables.map(function(table) {
        var storeName = table instanceof _this.Table ? table.name : table;
        if (typeof storeName !== "string")
          throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
        return storeName;
      });
      if (mode == "r" || mode === READONLY)
        idbMode = READONLY;
      else if (mode == "rw" || mode == READWRITE)
        idbMode = READWRITE;
      else
        throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);
      if (parentTransaction) {
        if (parentTransaction.mode === READONLY && idbMode === READWRITE) {
          if (onlyIfCompatible) {
            parentTransaction = null;
          } else
            throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
        }
        if (parentTransaction) {
          storeNames.forEach(function(storeName) {
            if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
              if (onlyIfCompatible) {
                parentTransaction = null;
              } else
                throw new exceptions.SubTransaction("Table " + storeName + " not included in parent transaction.");
            }
          });
        }
        if (onlyIfCompatible && parentTransaction && !parentTransaction.active) {
          parentTransaction = null;
        }
      }
    } catch (e) {
      return parentTransaction ? parentTransaction._promise(null, function(_23, reject) {
        reject(e);
      }) : rejection(e);
    }
    var enterTransaction = enterTransactionScope.bind(null, this, idbMode, storeNames, parentTransaction, scopeFunc);
    return parentTransaction ? parentTransaction._promise(idbMode, enterTransaction, "lock") : PSD.trans ? usePSD(PSD.transless, function() {
      return _this._whenReady(enterTransaction);
    }) : this._whenReady(enterTransaction);
  };
  Dexie5.prototype.table = function(tableName) {
    if (!hasOwn(this._allTables, tableName)) {
      throw new exceptions.InvalidTable("Table " + tableName + " does not exist");
    }
    return this._allTables[tableName];
  };
  return Dexie5;
}();
var Dexie$1 = Dexie;
props(Dexie$1, __assign(__assign({}, fullNameExceptions), {
  delete: function(databaseName) {
    var db = new Dexie$1(databaseName);
    return db.delete();
  },
  exists: function(name) {
    return new Dexie$1(name, {addons: []}).open().then(function(db) {
      db.close();
      return true;
    }).catch("NoSuchDatabaseError", function() {
      return false;
    });
  },
  getDatabaseNames: function(cb) {
    return databaseEnumerator ? databaseEnumerator.getDatabaseNames().then(cb) : DexiePromise.resolve([]);
  },
  defineClass: function() {
    function Class(content) {
      extend(this, content);
    }
    return Class;
  },
  ignoreTransaction: function(scopeFunc) {
    return PSD.trans ? usePSD(PSD.transless, scopeFunc) : scopeFunc();
  },
  vip,
  async: function(generatorFn) {
    return function() {
      try {
        var rv = awaitIterator(generatorFn.apply(this, arguments));
        if (!rv || typeof rv.then !== "function")
          return DexiePromise.resolve(rv);
        return rv;
      } catch (e) {
        return rejection(e);
      }
    };
  },
  spawn: function(generatorFn, args, thiz) {
    try {
      var rv = awaitIterator(generatorFn.apply(thiz, args || []));
      if (!rv || typeof rv.then !== "function")
        return DexiePromise.resolve(rv);
      return rv;
    } catch (e) {
      return rejection(e);
    }
  },
  currentTransaction: {
    get: function() {
      return PSD.trans || null;
    }
  },
  waitFor: function(promiseOrFunction, optionalTimeout) {
    var promise = DexiePromise.resolve(typeof promiseOrFunction === "function" ? Dexie$1.ignoreTransaction(promiseOrFunction) : promiseOrFunction).timeout(optionalTimeout || 6e4);
    return PSD.trans ? PSD.trans.waitFor(promise) : promise;
  },
  Promise: DexiePromise,
  debug: {
    get: function() {
      return debug;
    },
    set: function(value) {
      setDebug(value, value === "dexie" ? function() {
        return true;
      } : dexieStackFrameFilter);
    }
  },
  derive,
  extend,
  props,
  override,
  Events,
  getByKeyPath,
  setByKeyPath,
  delByKeyPath,
  shallowClone,
  deepClone,
  getObjectDiff,
  asap,
  minKey,
  addons: [],
  connections,
  errnames,
  dependencies: function() {
    try {
      return {
        indexedDB: _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
        IDBKeyRange: _global.IDBKeyRange || _global.webkitIDBKeyRange
      };
    } catch (e) {
      return {indexedDB: null, IDBKeyRange: null};
    }
  }(),
  semVer: DEXIE_VERSION,
  version: DEXIE_VERSION.split(".").map(function(n) {
    return parseInt(n);
  }).reduce(function(p, c, i) {
    return p + c / Math.pow(10, i * 2);
  }),
  default: Dexie$1,
  Dexie: Dexie$1
}));
Dexie$1.maxKey = getMaxKey(Dexie$1.dependencies.IDBKeyRange);
initDatabaseEnumerator(Dexie.dependencies.indexedDB);
DexiePromise.rejectionMapper = mapError;
setDebug(debug, dexieStackFrameFilter);
const dexie_default = Dexie;

// src/dexie/DexieRecord.ts
class DexieRecord2 {
  constructor(modelConstructor, table, meta2) {
    this.modelConstructor = modelConstructor;
    this.table = table;
    this.meta = meta2;
  }
  async get(pk6) {
    return this.table.get(pk6).catch((e) => {
      throw new DexieError2(`DexieRecord: problem getting record ${JSON.stringify(pk6)} of model ${capitalize(this.meta.modelName)}: ${e.message}`, `dexie/${e.code || e.name || "get"}`);
    });
  }
  async add(record) {
    if (this.meta.hasDynamicPath) {
      if (!this.meta.dynamicPathComponents.every((i) => record[i])) {
        throw new DexieError2(`The model ${capitalize(this.meta.modelName)} is based on a dynamic path [ ${this.meta.dynamicPathComponents.join(", ")} ] and every part of this path is therefore a required field but the record hash passed in did not define values for all these properties. The properties which WERE pass in included: ${Object.keys(record).join(", ")}`, "dexie/missing-property");
      }
    }
    if (!record.id) {
      record.id = key();
    }
    const now = new Date().getTime();
    record.createdAt = now;
    record.lastUpdated = now;
    const pk6 = await this.table.add(record).catch((e) => {
      throw new DexieError2(`DexieRecord: Problem adding record to ${capitalize(this.meta.modelName)}: ${e.message}`, `dexie/${e.code || e.name || "add"}`);
    });
    return this.get(pk6);
  }
  async update(pk6, updateHash) {
    const now = new Date().getTime();
    updateHash.lastUpdated = now;
    const result = await this.table.update(pk6, updateHash).catch((e) => {
      throw new DexieError2(`DexieRecord: Problem updating ${capitalize(this.meta.modelName)}.${typeof pk6 === "string" ? pk6 : pk6.id}: ${e.message}`, `dexie/${e.code || e.name || "update"}`);
    });
    if (result === 0) {
      throw new DexieError2(`The primary key passed in to record.update(${JSON.stringify(pk6)}) was NOT found in the IndexedDB!`, "dexie/record-not-found");
    }
    if (result > 1) {
      throw new DexieError2(`While calling record.update(${JSON.stringify(pk6)}) MORE than one record was updated!`, "dexie/unexpected-error");
    }
  }
  async remove(id) {
    return this.table.delete(id).catch((e) => {
      throw new DexieError2(`Problem removing record ${JSON.stringify(id)} from the ${capitalize(this.meta.modelName)}: ${e.message}`, `dexie/${e.code || e.name || "remove"}`);
    });
  }
}

// src/dexie/DexieList.ts
class DexieList2 {
  constructor(modelConstructor, table, meta2) {
    this.modelConstructor = modelConstructor;
    this.table = table;
    this.meta = meta2;
  }
  async all(options = {
    orderBy: "lastUpdated"
  }) {
    const c = this.meta.hasDynamicPath ? this.table : this.table.orderBy(options.orderBy);
    if (options.limit) {
      c.limit(options.limit);
    }
    if (options.offset) {
      c.offset(options.offset);
    }
    const results = c.toArray().catch((e) => {
      if (e.code === "NotFoundError" || e.name === "NotFoundError") {
        console.info(`No records for model ${capitalize(this.meta.modelName)} found!`);
        return [];
      } else {
        throw new DexieError2(`Problem with list(${capitalize(this.meta.modelName)}).all(${JSON.stringify(options)}): ${e.message}`, `dexie/${e.code || e.name || "list.all"}`);
      }
    });
    return results || [];
  }
  async where(prop, value, options = {}) {
    const [op, val] = Array.isArray(value) && ["=", ">", "<"].includes(value[0]) ? value : ["=", value];
    let query = op === "=" ? this.table.where(prop).equals(val) : op === ">" ? this.table.where(prop).above(val) : this.table.where(prop).below(val);
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.offset(options.offset);
    }
    const results = query.toArray().catch((e) => {
      if (e.code === "NotFoundError" || e.name === "NotFoundError") {
        console.info(`No records for model ${capitalize(this.meta.modelName)} found!`);
        return [];
      } else {
        throw new DexieError2(`list.where("${prop}", ${JSON.stringify(value)}, ${JSON.stringify(options)}) failed to execute: ${e.message}`, `dexie/${e.code || e.name || "list.where"}`);
      }
    });
    return results || [];
  }
  async recent(limit, skip) {
    const c = skip ? this.table.orderBy("lastUpdated").reverse().limit(limit).offset(skip) : this.table.orderBy("lastUpdated").reverse().limit(limit);
    return c.toArray();
  }
  async since(datetime2, options = {}) {
    return this.where("lastUpdated", [">", datetime2]);
  }
  async last(limit, skip) {
    const c = skip ? this.table.orderBy("createdAt").reverse().limit(limit).offset(skip) : this.table.orderBy("createdAt").reverse().limit(limit);
    return c.toArray().catch((e) => {
      if (e.code === "NotFoundError" || e.name === "NotFoundError") {
        console.info(`No records for model ${capitalize(this.meta.modelName)} found!`);
        return [];
      } else {
        throw new DexieError2(`list.last(${limit}${skip ? `, skip: ${skip}` : ""}) failed to execute: ${e.message}`, `dexie/${e.code || e.name || "list.last"}`);
      }
    });
  }
  async first(limit, skip) {
    const c = skip ? this.table.orderBy("createdAt").limit(limit).offset(skip) : this.table.orderBy("createdAt").limit(limit);
    return c.toArray().catch((e) => {
      if (e.code === "NotFoundError" || e.name === "NotFoundError") {
        console.info(`No records for model ${capitalize(this.meta.modelName)} found!`);
        return [];
      } else {
        throw new DexieError2(`list.first(${limit}${skip ? `, skip: ${skip}` : ""}) failed to execute: ${e.message}`, `dexie/${e.code || e.name || "list.first"}`);
      }
    });
  }
}

// src/dexie/DexieDb.ts
class DexieDb {
  constructor(_name, ...models2) {
    this._name = _name;
    this._models = {};
    this._constructors = {};
    this._meta = {};
    this._singularToPlural = {};
    this._currentVersion = 1;
    this._priors = [];
    this._isMapped = false;
    this._status = "initialized";
    this._models = DexieDb.modelConversion(...models2);
    this._db = DexieDb._indexedDb ? new dexie_default(this._name, {indexedDB: DexieDb._indexedDb}) : new dexie_default(this._name);
    this._db.on("blocked", () => {
      this._status = "blocked";
    });
    this._db.on("populate", () => {
      this._status = "populate";
    });
    this._db.on("ready", () => {
      this._status = "ready";
    });
    models2.forEach((m) => {
      const r = Record2.create(m);
      this._constructors[r.pluralName] = m;
      this._meta[r.pluralName] = {
        ...r.META,
        modelName: r.modelName,
        hasDynamicPath: r.hasDynamicPath,
        dynamicPathComponents: r.dynamicPathComponents,
        pluralName: r.pluralName
      };
      this._singularToPlural[r.modelName] = r.pluralName;
    });
  }
  static modelConversion(...modelConstructors) {
    if (modelConstructors.length === 0) {
      throw new FireModelError2(`A call to DexieModel.models() was made without passing in ANY firemodel models into it! You must at least provide one model`, "firemodel/no-models");
    }
    return modelConstructors.reduce((agg, curr) => {
      const dexieModel = [];
      const r = Record2.createWith(curr, new curr());
      const compoundIndex = r.hasDynamicPath ? ["id"].concat(r.dynamicPathComponents) : "";
      if (compoundIndex) {
        dexieModel.push(`[${compoundIndex.join("+")}]`);
      }
      (r.hasDynamicPath ? [] : ["id"]).concat((r.META.dbIndexes || []).filter((i) => i.isUniqueIndex).map((i) => i.property)).forEach((i) => dexieModel.push(`&${i}`));
      const indexes = [].concat((r.META.dbIndexes || []).filter((i) => i.isIndex && !i.isUniqueIndex).map((i) => i.property)).concat(r.hasDynamicPath ? r.dynamicPathComponents.filter((i) => !r.META.dbIndexes.map((idx) => idx.property).includes(i)) : []).forEach((i) => dexieModel.push(i));
      const multiEntryIndex = [].concat(r.META.dbIndexes.filter((i) => i.isMultiEntryIndex).map((i) => i.property)).forEach((i) => dexieModel.push(`*${i}`));
      agg[r.pluralName] = dexieModel.join(",").trim();
      return agg;
    }, {});
  }
  static indexedDB(indexedDB, idbKeyRange) {
    DexieDb._indexedDb = indexedDB;
    if (idbKeyRange) {
      dexie_default.dependencies.IDBKeyRange = idbKeyRange;
    }
  }
  get models() {
    return this._models;
  }
  get dbName() {
    return this._name;
  }
  get version() {
    return this._currentVersion;
  }
  get modelNames() {
    return Object.keys(this._singularToPlural);
  }
  get pluralNames() {
    return Object.keys(this._models);
  }
  get db() {
    return this._db;
  }
  get status() {
    return this._status;
  }
  get isMapped() {
    return this._isMapped;
  }
  get dexieTables() {
    return this.db.tables.map((t) => ({
      name: t.name,
      schema: t.schema
    }));
  }
  addPriorVersion(version) {
    this._priors.push(version);
    this._currentVersion++;
    return this;
  }
  modelIsManagedByDexie(model3) {
    const r = Record2.create(model3);
    return this.modelNames.includes(r.modelName);
  }
  table(model3) {
    const r = Record2.create(model3);
    if (!this.isOpen()) {
      this.open();
    }
    if (!this.modelIsManagedByDexie(model3)) {
      throw new DexieError2(`Attempt to get a Dexie.Table for "${capitalize(r.modelName)}" Firemodel model but this model is not being managed by Dexie! Models being managed are: ${this.modelNames.join(", ")}`, "dexie/table-does-not-exist");
    }
    const table = this._db.table(r.pluralName);
    table.mapToClass(model3);
    return table;
  }
  record(model3) {
    const r = Record2.create(model3);
    if (!this.modelNames.includes(r.modelName)) {
      const isPlural = this.pluralNames.includes(r.modelName);
      throw new DexieError2(`Attempt to reach the record API via DexieDb.record("${model3}") failed as there is no known Firemodel model of that name. ${isPlural ? "It looks like you may have accidentally used the plural name instead" : ""}. Known model types are: ${this.modelNames.join(", ")}`, "dexie/model-does-not-exist");
    }
    if (!this.isOpen()) {
      this.open();
    }
    return new DexieRecord2(model3, this.table(model3), this.meta(r.modelName));
  }
  list(model3) {
    const r = Record2.create(model3);
    if (!this.isOpen()) {
      this.open();
    }
    const table = r.hasDynamicPath ? this.table(model3) : this.table(model3);
    const meta2 = this.meta(r.modelName);
    return new DexieList2(model3, table, meta2);
  }
  meta(name, _originated = "meta") {
    return this._checkPluralThenSingular(this._meta, name, _originated);
  }
  modelConstructor(name) {
    return this._checkPluralThenSingular(this._constructors, name, "modelConstructor");
  }
  isOpen() {
    return this._db.isOpen();
  }
  mapModels() {
    this._mapVersionsToDexie();
    this._status = "mapped";
    this._isMapped = true;
  }
  async open() {
    if (this._db.isOpen()) {
      throw new DexieError2(`Attempt to call DexieDb.open() failed because the database is already open!`, `dexie/db-already-open`);
    }
    if (!this.isMapped) {
      this.mapModels();
    }
    return this._db.open();
  }
  close() {
    if (!this._db.isOpen()) {
      throw new DexieError2(`Attempt to call DexieDb.close() failed because the database is NOT open!`, `dexie/db-not-open`);
    }
    this._db.close();
  }
  _checkPluralThenSingular(obj, name, fn) {
    if (obj[name]) {
      return obj[name];
    } else if (this._singularToPlural[name]) {
      return obj[this._singularToPlural[name]];
    }
    throw new DexieError2(`Failed while calling DexieModel.${fn}("${name}") because "${name}" is neither a singular or plural name of a known model!`, `firemodel/invalid-dexie-model`);
  }
  _mapVersionsToDexie() {
    this._priors.forEach((prior, idx) => {
      if (prior.upgrade) {
        this._db.version(idx + 1).stores(prior.models).upgrade(prior.upgrade);
      } else {
        this._db.version(idx).stores(prior.models);
      }
    });
    this._db.version(this._currentVersion).stores(this.models);
    this._isMapped = true;
  }
}

// src/dexie/index.ts

// src/index.ts
export {
  AuditLog,
  DexieDb,
  DexieList2 as DexieList,
  DexieRecord2 as DexieRecord,
  FireModel2 as FireModel,
  FmEvents,
  IFmCrudOperations,
  List,
  Mock,
  Model59 as Model,
  OneWay,
  Record2 as Record,
  RelationshipCardinality,
  RelationshipPolicy,
  VeuxWrapper,
  Watch,
  belongsTo,
  constrain,
  constrainedProperty,
  createCompositeKey,
  defaultValue,
  desc,
  encrypt,
  key as fbKey,
  hasMany,
  hasOne,
  index6 as index,
  isConstructable,
  length,
  listRegisteredModels,
  max3 as max,
  min3 as min,
  mock,
  model,
  modelConstructorLookup,
  modelNameLookup,
  modelRegister,
  modelRegistryLookup,
  ownedBy,
  pathJoin2 as pathJoin,
  property,
  pushKey,
  uniqueIndex
};
