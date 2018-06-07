'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('reflect-metadata');
var lodashEs = require('lodash-es');
var commonTypes = require('common-types');
var pluralize = require('pluralize');
var serializedQuery = require('serialized-query');
var firebaseKey = require('firebase-key');

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null) return null;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

var _this = undefined;

function push(target, path, value) {
  if (Array.isArray(lodashEs.get(target, path))) {
    lodashEs.get(target, path).push(value);
  } else {
    lodashEs.set(target, path, [value]);
  }
}
/** Properties accumlated by propertyDecorators and grouped by schema */


var propertiesBySchema = {};
/** Relationships accumlated by propertyDecorators and grouped by schema */

var relationshipsBySchema = {};
var propertyDecorator = function propertyDecorator() {
  var nameValuePairs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var
  /**
   * if you want to set the property being decorated's name
   * as property on meta specify the meta properties name here
   */
  property = arguments.length > 1 ? arguments[1] : undefined;
  return function (target, key) {
    var reflect = Reflect.getMetadata("design:type", target, key);
    var meta = Object.assign({}, Reflect.getMetadata(key, target), {
      type: reflect.name
    }, nameValuePairs);
    Reflect.defineMetadata(key, meta, target);
    var _val = _this[key];

    if (nameValuePairs.isProperty) {
      if (property) {
        push(propertiesBySchema, target.constructor.name, Object.assign({}, meta, _defineProperty({}, property, key)));
      } else {
        push(propertiesBySchema, target.constructor.name, meta);
      }
    }

    if (nameValuePairs.isRelationship) {
      if (property) {
        push(relationshipsBySchema, target.constructor.name, Object.assign({}, meta, _defineProperty({}, property, key)));
      } else {
        push(relationshipsBySchema, target.constructor.name, meta);
      }
    } // Reflect.defineProperty(target, key, {
    //   get: () => {
    //     return this[key];
    //   },
    //   set: (value: any) => {
    //     this[key] = value;
    //   },
    //   enumerable: true,
    //   configurable: true
    // });

  };
};
/**
 * Give all properties from schema and base schema
 *
 * @param target the schema object which is being looked up
 */


function getProperties(target) {
  return _toConsumableArray(propertiesBySchema[target.constructor.name]).concat(_toConsumableArray(propertiesBySchema.BaseSchema.map(function (s) {
    return Object.assign({}, s, {
      isBaseSchema: true
    });
  })));
}
function getRelationships(target) {
  return relationshipsBySchema[target.constructor.name];
}
function getPushKeys(target) {
  var props = getProperties(target);
  return props.filter(function (p) {
    return p.pushKey;
  }).map(function (p) {
    return p.property;
  });
}

function constrainedProperty() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return propertyDecorator(Object.assign({}, options, {
    isRelationship: false,
    isProperty: true
  }), "property");
}
/** allows the introduction of a new constraint to the metadata of a property */

function constrain(prop, value) {
  return propertyDecorator(_defineProperty({}, prop, value));
}
function desc(value) {
  return propertyDecorator({
    desc: value
  });
}
function min(value) {
  return propertyDecorator({
    min: value
  });
}
function max(value) {
  return propertyDecorator({
    max: value
  });
}
function length(value) {
  return propertyDecorator({
    length: value
  });
}
var property = propertyDecorator({
  isRelationship: false,
  isProperty: true
}, "property");
var pushKey = propertyDecorator({
  pushKey: true
}, "property");

function hasMany(schemaClass) {
  return propertyDecorator({
    isRelationship: true,
    isProperty: false,
    relType: 'hasMany'
  }, 'property');
}
function ownedBy(schemaClass) {
  return propertyDecorator({
    isRelationship: true,
    isProperty: false,
    relType: 'ownedBy'
  }, 'property');
}
function inverse(inverseProperty) {
  return propertyDecorator({
    inverseProperty: inverseProperty
  });
}

/** lookup meta data for schema properties */

function propertyMeta$1(context) {
  return function (prop) {
    return Reflect.getMetadata(prop, context);
  };
}

function schema(options) {
  return function (target) {
    var original = target; // new constructor

    var f = function f() {

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var obj = Reflect.construct(original, args);
      Reflect.defineProperty(obj, "META", {
        get: function get() {
          return Object.assign({}, options, {
            property: propertyMeta$1(obj)
          }, {
            properties: getProperties(obj)
          }, {
            relationships: getRelationships(obj)
          }, {
            pushKeys: getPushKeys(obj)
          }, {
            audit: options.audit ? options.audit : false
          });
        },
        set: function set() {
          throw new Error("The meta property can only be set with the @schema decorator!");
        },
        configurable: false,
        enumerable: false
      });
      return obj;
    }; // copy prototype so intanceof operator still works


    f.prototype = original.prototype; // return new constructor (will override original)

    return f;
  };
}

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc$$1) {
  var c = arguments.length,
      r = c < 3 ? target : desc$$1 === null ? desc$$1 = Object.getOwnPropertyDescriptor(target, key) : desc$$1,
      d;
  if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc$$1);else for (var i = decorators.length - 1; i >= 0; i--) {
    if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  }
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var __metadata = undefined && undefined.__metadata || function (k, v) {
  if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

(function (RelationshipPolicy) {
  RelationshipPolicy["keys"] = "keys";
  RelationshipPolicy["lazy"] = "lazy";
  RelationshipPolicy["inline"] = "inline";
})(exports.RelationshipPolicy || (exports.RelationshipPolicy = {}));

(function (RelationshipCardinality) {
  RelationshipCardinality["hasMany"] = "hasMany";
  RelationshipCardinality["belongsTo"] = "belongsTo";
})(exports.RelationshipCardinality || (exports.RelationshipCardinality = {}));

var BaseSchema =
/*#__PURE__*/
function () {
  function BaseSchema() {
    _classCallCheck(this, BaseSchema);
  }

  _createClass(BaseSchema, [{
    key: "toString",
    value: function toString() {
      var _this = this;

      var obj = {};
      this.META.properties.map(function (p) {
        obj[p.property] = _this[p.property];
      });
      return JSON.stringify(obj);
    }
  }]);

  return BaseSchema;
}();

__decorate([property, __metadata("design:type", String)], BaseSchema.prototype, "id", void 0);

__decorate([property, __metadata("design:type", Number)], BaseSchema.prototype, "lastUpdated", void 0);

__decorate([property, __metadata("design:type", Number)], BaseSchema.prototype, "createdAt", void 0);

var chalk;
var VerboseError =
/*#__PURE__*/
function (_Error) {
  _inherits(VerboseError, _Error);

  _createClass(VerboseError, null, [{
    key: "setStackParser",

    /**
     * If you want to use a library like stack-trace(node) or stacktrace-js(client) add in the "get"
     * function that they provide
     */
    value: function setStackParser(fn) {
      VerboseError.stackParser = fn;
    }
  }, {
    key: "stackParser",
    value: function stackParser(err) {
      return undefined;
    }
  }]);

  function VerboseError(err) {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, VerboseError);

    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(VerboseError)).call.apply(_getPrototypeOf2, [this].concat(args)));
    _this.code = err.code;
    _this.message = err.message;
    _this.module = err.module;
    _this.function = err.function;

    if (VerboseError.useColor) {
      // tslint:disable-next-line:no-implicit-dependencies
      chalk = require("chalk");
    }

    var stackFrames = VerboseError.stackParser(_assertThisInitialized(_assertThisInitialized(_this)));

    if (stackFrames) {
      _this.stackFrames = stackFrames.filter(function (frame) {
        return (frame.getFileName() || "").indexOf("common-types") === -1;
      });
      _this.function = stackFrames[0].getMethodName();
      _this.stack = _this.message + "\n\n" + _this.stackFrames.map(function (frame) {
        var isNative = typeof frame.isNative === "function" ? frame.isNative() : frame.isNative;

        var colorize = function colorize(content) {
          return VerboseError.useColor && isNative ? chalk.grey.italic(content) : content;
        };

        var className = frame.getTypeName() ? frame.getTypeName() + " → " : "";
        var functionName = frame.getMethodName() || frame.getFunctionName() || "<anonymous>";
        var classAndFunction = VerboseError.useColor ? chalk.bold("".concat(className).concat(functionName)) : "".concat(className).concat(functionName);
        var fileName = (frame.getFileName() || "").split("/").slice(-1 * VerboseError.filePathDepth).join("/");
        var details = isNative ? "( native function )" : "[ line ".concat(frame.getLineNumber(), ", col ").concat(frame.getColumnNumber(), " in ").concat(fileName, " ]");
        return colorize("\t at ".concat(classAndFunction, " ").concat(details));
      }).join("\n");
    } else {
      _this.stack = _this.stack.split("\n").filter(function (line) {
        return line.indexOf("VerboseError") === -1;
      }).join("\n");
    }

    return _this;
  }

  _createClass(VerboseError, [{
    key: "toString",
    value: function toString() {
      return this.message + this.stack;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return JSON.stringify(this.toObject(), null, 2);
    }
  }, {
    key: "toObject",
    value: function toObject() {
      return {
        code: this.code,
        message: this.message,
        module: this.module
      };
    }
  }]);

  return VerboseError;
}(_wrapNativeSuper(Error));

function normalized() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return args.filter(function (a) {
    return a;
  }).map(function (a) {
    return a.replace(/$[\.\/]/, "").replace(/[\.\/]^/, "");
  }).map(function (a) {
    return a.replace(/\./g, "/");
  });
}
function slashNotation() {
  return normalized.apply(void 0, arguments).join("/");
}

var _this$1 = undefined;

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : new P(function (resolve) {
        resolve(result.value);
      }).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var baseLogger = {
  log: function log(message) {
    return console.log("".concat(_this$1.modelName, "/").concat(_this$1._key, ": ").concat(message));
  },
  warn: function warn(message) {
    return console.warn("".concat(_this$1.modelName, "/").concat(_this$1._key, ": ").concat(message));
  },
  debug: function debug(message) {
    var stage = process.env.STAGE || process.env.AWS_STAGE || process.env.ENV;

    if (stage !== "prod") {
      console.log("".concat(_this$1.modelName, "/").concat(_this$1._key, ": ").concat(message));
    }
  },
  error: function error(message) {
    return console.error("".concat(_this$1.modelName, "/").concat(_this$1._key, ": ").concat(message));
  }
};
var Model$$1 =
/*#__PURE__*/
function () {
  //#endregion
  function Model$$1(_schemaClass, db, logger) {
    var _this2 = this;

    _classCallCheck(this, Model$$1);

    this._schemaClass = _schemaClass; // tslint:disable-next-line:member-ordering

    this._mockGenerator = function (h) {
      return function () {
        return _this2._bespokeMockGenerator ? Object.assign({}, _this2._defaultGenerator(h)(), _this2._bespokeMockGenerator(h)()) : _this2._defaultGenerator(h)();
      };
    };

    this._defaultGenerator = function (h) {
      return function () {
        return {
          createdAt: new Date(h.faker.date.past()).toISOString(),
          lastUpdated: new Date().toISOString()
        };
      };
    };

    this._db = db;

    if (!Model$$1.defaultDb) {
      Model$$1.defaultDb = db;
    }

    this.logger = logger ? logger : baseLogger;
    this._schema = new this.schemaClass();
  }

  _createClass(Model$$1, [{
    key: "getRecord",
    // /**
    //  * Add a new record of type T, optionally including the payload
    //  *
    //  * @param hash the values that you want this new object to be initialized as; note that if you include an "id" property it will assume this is from the DB, if you don't then it will immediately add it and create an id.
    //  */
    // public async newRecord(hash?: Partial<T>) {
    //   console.log(this.schemaClass);
    //   return hash
    //     ? Record.add(this.schemaClass, hash as T, { db: this.db })
    //     : Record.create(this.schemaClass, { db: this.db });
    // }

    /**
     * Get an existing record from the  DB and return as a Record
     *
     * @param id the primary key for the record
     */
    value: function getRecord(id) {
      return __awaiter(this, void 0, void 0, function* () {
        var record = yield Record.get(this._schemaClass, id);
        return record;
      });
    }
    /**
     * Returns a list of ALL objects of the given schema type
     */

  }, {
    key: "getAll",
    value: function getAll(query) {
      return __awaiter(this, void 0, void 0, function* () {
        var list = new List$$1(this);
        return query ? list.load(query) : list.load(this.dbPath);
      });
    }
    /**
     * Finds a single records within a list
     *
     * @param prop the property on the Schema which you are looking for a value in
     * @param value the value you are looking for the property to equal; alternatively you can pass a tuple with a comparison operation and a value
     */

  }, {
    key: "findRecord",
    value: function findRecord(prop, value) {
      return __awaiter(this, void 0, void 0, function* () {
        var query = this._findBuilder(prop, value, true);

        var results = yield this.db.getList(query);

        if (results.length > 0) {
          var first = results.pop();
          var record = Record.get(this._schemaClass, first.id);
          return record;
        } else {
          throw commonTypes.createError("not-found", "Not Found: didn't find any \"".concat(this.pluralName, "\" which had \"").concat(prop, "\" set to \"").concat(value, "\"; note the path in the database which was searched was \"").concat(this.dbPath, "\"."));
        }
      });
    }
  }, {
    key: "findAll",
    value: function findAll(prop, value) {
      return __awaiter(this, void 0, void 0, function* () {
        var query = this._findBuilder(prop, value);

        var results;

        try {
          results = yield this.db.getList(query);
        } catch (e) {
          console.log("Error attempting to findAll() in Model.", e);
          throw commonTypes.createError("model/findAll", "\nFailed getting via getList() with query" + JSON.stringify(query, null, 2), e);
        }

        return new List$$1(this, results);
      });
    }
    /** sets a record to the database */

  }, {
    key: "set",
    value: function set(record) {
      var auditInfo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return __awaiter(this, void 0, void 0, function* () {
        if (!record.id) {
          throw commonTypes.createError("set/no-id", "Attempt to set \"".concat(this.dbPath, "\" in database but record had no \"id\" property."));
        }

        var now = this.now();
        record = Object.assign({}, record, {
          lastUpdated: now
        });
        auditInfo = Object.assign({}, auditInfo, {
          properties: Object.keys(record)
        });
        var ref = yield this.crud("set", now, slashNotation(this.dbPath, record.id), record, auditInfo);
        return ref;
      });
    }
    /** Push a new record onto a model's list using Firebase a push-ID */

  }, {
    key: "push",
    value: function push(newRecord) {
      var auditInfo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return __awaiter(this, void 0, void 0, function* () {
        var now = this.now();
        var id = firebaseKey.key();
        newRecord = Object.assign({}, newRecord, {
          lastUpdated: now,
          createdAt: now
        });
        auditInfo = Object.assign({}, auditInfo, {
          properties: Object.keys(newRecord)
        });
        return Record.get(this._schemaClass, id);
      });
    }
  }, {
    key: "update",
    value: function update(key, updates) {
      var auditInfo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return __awaiter(this, void 0, void 0, function* () {
        var now = this.now();
        auditInfo = Object.assign({
          auditInfo: auditInfo
        }, {
          updatedProperties: Object.keys(updates)
        });
        updates = Object.assign({}, updates, {
          lastUpdated: now
        });
        yield this.crud("update", now, slashNotation(this.dbPath, key), updates, auditInfo);
      });
    }
    /**
     * Remove
     *
     * Remove a record from the database
     *
     * @param key         the specific record id (but can alternatively be the full path if it matches dbPath)
     * @param returnValue optionally pass back the deleted record along removing from server
     * @param auditInfo   any additional information to be passed to the audit record (if Model has turned on)
     */

  }, {
    key: "remove",
    value: function remove(key) {
      var returnValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var auditInfo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return __awaiter(this, void 0, void 0, function* () {
        if (!key) {
          var e = new Error("Trying to call remove(id) on a ".concat(this.modelName, " Model class can not be done when ID is undefined!"));
          e.name = "NotAllowed";
          throw e;
        }

        var now = this.now();
        var value;

        if (returnValue) {
          value = yield this._db.getValue(slashNotation(this.dbPath, key));
        }

        yield this.crud("remove", now, key.match(this.dbPath) ? key : slashNotation(this.dbPath, key), null, auditInfo);
        return returnValue ? value : undefined;
      });
    }
  }, {
    key: "getAuditTrail",
    value: function getAuditTrail() {
      var filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return __awaiter(this, void 0, void 0, function* () {
        var since = filter.since,
            last = filter.last;
        var path = "".concat(Model$$1.auditBase, "/").concat(this.pluralName);
        var query = serializedQuery.SerializedQuery.path(path);

        if (since) {
          var startAt = new Date(since).toISOString();
          query = query.orderByChild("when").startAt(startAt);
        }

        if (last) {
          query = query.limitToLast(last);
        }

        return this.db.getList(query);
      });
    } //#endregion
    //#region PRIVATE API

  }, {
    key: "audit",
    value: function audit(crud, when, key, info) {
      return __awaiter(this, void 0, void 0, function* () {
        var path = slashNotation(Model$$1.auditBase, this.pluralName);
        return this.db.push(path, {
          crud: crud,
          when: when,
          key: key,
          info: info
        });
      });
    }
    /**
     * crud
     *
     * Standardized processing of all CRUD operations
     *
     * @param op The CRUD operation being performed
     * @param key The record id which is being performed on
     * @param value The new-value parameter (meaning varies on context)
     * @param auditInfo the meta-fields for the audit trail
     */

  }, {
    key: "crud",
    value: function crud(op, when, key, value, auditInfo) {
      return __awaiter(this, void 0, void 0, function* () {
        var _this3 = this;

        var isAuditable = this._schema.META.audit;

        if (isAuditable) {
          console.log("auditing: ", op);
          yield this.audit(op, when, key, auditInfo);
        }

        switch (op) {
          case "set":
            return this.db.set(key, value);

          case "update":
            return this.db.update(key, value);

          case "push":
            // PUSH unlike SET returns a reference to the newly created record
            return this.db.set(key, value).then(function () {
              return _this3.db.ref(key);
            });

          case "remove":
            return this.db.remove(key);

          default:
            throw new VerboseError({
              code: "unknown-operation",
              message: "The operation \"".concat(op, "\" is not known!"),
              module: "crud"
            });
        }
      });
    }
  }, {
    key: "_findBuilder",
    value: function _findBuilder(child, value) {
      var singular = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var operation = "=";

      if (value instanceof Array) {
        operation = value[0];
        value = value[1];
      }

      var query = serializedQuery.SerializedQuery.path(this.dbPath).orderByChild(child);

      if (singular) {
        query = query.limitToFirst(1);
      }

      switch (operation) {
        case "=":
          return query.equalTo(value);

        case ">":
          return query.startAt(value);

        case "<":
          return query.endAt(value);

        default:
          throw new VerboseError({
            code: "invalid-operation",
            message: "Invalid comparison operater \"".concat(operation, "\" used in find query"),
            module: "findXXX"
          });
      }
    } //#region mocking
    // tslint:disable-next-line:member-ordering

  }, {
    key: "generate",
    value: function generate(quantity) {
      var override = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      this.db.mock.queueSchema(this.modelName, quantity, override);
      this.db.mock.generate();
    } //#endregion

  }, {
    key: "now",
    value: function now() {
      return Date.now();
    }
  }, {
    key: "modelName",

    /** the singular name of the model */
    get: function get() {
      return lodashEs.camelCase(this._schema.constructor.name);
    }
  }, {
    key: "pluralName",
    get: function get() {
      return this._pluralName ? this._pluralName : pluralize.plural(this.modelName);
    },
    set: function set(name) {
      this._pluralName = name;
    }
  }, {
    key: "mockGenerator",
    set: function set(cb) {
      this._bespokeMockGenerator = cb;
    } //#region PUBLIC API

  }, {
    key: "schemaClass",
    get: function get() {
      return this._schemaClass;
    }
    /** Database access */

  }, {
    key: "db",
    get: function get() {
      return this._db;
    }
  }, {
    key: "schema",
    get: function get() {
      return this._schema;
    }
  }, {
    key: "dbPath",
    get: function get() {
      return [this._schema.META.dbOffset, this.pluralName].join(".");
    }
  }, {
    key: "localPath",
    get: function get() {
      return [this._schema.META.localOffset, this.pluralName].join(".");
    }
  }, {
    key: "relationships",
    get: function get() {
      return this._schema.META.relationships;
    }
  }, {
    key: "properties",
    get: function get() {
      return this._schema.META.properties;
    }
  }, {
    key: "pushKeys",
    get: function get() {
      return this._schema.META ? this._schema.META.pushKeys : [];
    }
  }], [{
    key: "create",
    value: function create(schema$$1) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var db = options.db || Model$$1.defaultDb;
      var logger = options.logger || baseLogger;
      var model = new Model$$1(schema$$1, db, logger);
      return model;
    }
  }]);

  return Model$$1;
}(); //#region PROPERTIES

Model$$1.defaultDb = null;
/** The base path in the database to store audit logs */

Model$$1.auditBase = "logging/audit_logs";

var __awaiter$1 = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : new P(function (resolve) {
        resolve(result.value);
      }).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var Record =
/*#__PURE__*/
function () {
  function Record(_model) {

    _classCallCheck(this, Record);

    this._model = _model;
    this._existsOnDB = false;
    this._writeOperations = [];
    this._data = new _model.schemaClass();
  }
  /**
   * create
   *
   * creates a new -- and empty -- Record object; often used in
   * conjunction with the Record's initialize() method
   */


  _createClass(Record, [{
    key: "_initialize",

    /**
     * Allows an empty Record to be initialized to a known state.
     * This is not intended to allow for mass property manipulation other
     * than at time of initialization
     *
     * @param data the initial state you want to start with
     */
    value: function _initialize(data) {
      var _this = this;

      Object.keys(data).map(function (key) {
        _this._data[key] = data[key];
      });
      var relationships = this.META.relationships;
      var ownedByRels = (relationships || []).filter(function (r) {
        return r.relType === "ownedBy";
      }).map(function (r) {
        return r.property;
      });
      var hasManyRels = (relationships || []).filter(function (r) {
        return r.relType === "hasMany";
      }).map(function (r) {
        return r.property;
      }); // default hasMany to empty hash

      hasManyRels.map(function (p) {
        if (!_this._data[p]) {
          _this._data[p] = {};
        }
      });
      var now = new Date().getTime();

      if (!this._data.lastUpdated) {
        this._data.lastUpdated = now;
      }

      if (!this._data.createdAt) {
        this._data.createdAt = now;
      }
    }
  }, {
    key: "update",
    value: function update(hash) {
      return __awaiter$1(this, void 0, void 0, function* () {
        if (!this.data.id || !this._existsOnDB) {
          throw new Error("Invalid Operation: you can not update a record which doesn't have an \"id\" or which has never been saved to the database");
        }

        return this.db.update(this.dbPath, hash);
      });
    }
    /**
     * Pushes new values onto properties on the record
     * which have been stated to be a "pushKey"
     */

  }, {
    key: "pushKey",
    value: function pushKey(property, value) {
      return __awaiter$1(this, void 0, void 0, function* () {
        if (this.META.pushKeys.indexOf(property) === -1) {
          throw commonTypes.createError("invalid-operation/not-pushkey", "Invalid Operation: you can not push to property \"".concat(property, "\" as it has not been declared a pushKey property in the schema"));
        }

        if (!this.existsOnDB) {
          throw commonTypes.createError("invalid-operation/not-on-db", "Invalid Operation: you can not push to property \"".concat(property, "\" before saving the record to the database"));
        }

        var key = firebaseKey.key();
        var currentState = this.get(property) || {};
        var newState = Object.assign({}, currentState, _defineProperty({}, key, value)); // set state locally

        this.set(property, newState); // push updates to db

        var write = this.db.multiPathSet("".concat(this.dbPath, "/"));
        write.add({
          path: "lastUpdated",
          value: new Date().getTime()
        });
        write.add({
          path: "".concat(property, "/").concat(key),
          value: value
        });

        try {
          yield write.execute();
        } catch (e) {
          throw commonTypes.createError("multi-path/write-error", "", e);
        }

        return key;
      });
    }
    /**
     * Updates a set of properties on a given model atomically (aka, all at once); will automatically
     * include the "lastUpdated" property.
     *
     * @param props a hash of name value pairs which represent the props being updated and their new values
     */

  }, {
    key: "updateProps",
    value: function updateProps(props) {
      return __awaiter$1(this, void 0, void 0, function* () {
        var _this2 = this;

        var updater = this.db.multiPathSet(this.dbPath);
        Object.keys(props).map(function (key) {
          if (_typeof(props[key]) === "object") {
            var existingState = _this2.get(key);

            props[key] = Object.assign({}, existingState, props[key]);
          } else {
            if (key !== "lastUpdated") {
              updater.add({
                path: key,
                value: props[key]
              });
            }
          }

          _this2.set(key, props[key]);
        });
        var now = new Date().getTime();
        updater.add({
          path: "lastUpdated",
          value: now
        });
        this._data.lastUpdated = now;

        try {
          yield updater.execute();
        } catch (e) {
          throw commonTypes.createError("UpdateProps", "An error occurred trying to update ".concat(this._model.modelName, ":").concat(this.id), e);
        }
      });
    }
    /**
     * Adds another fk to a hasMany relationship
     *
     * @param property the property which is acting as a foreign key (array)
     * @param ref reference to ID of related entity
     * @param optionalValue the default behaviour is to add the value TRUE but you can optionally add some additional piece of information here instead.
     */

  }, {
    key: "addHasMany",
    value: function addHasMany(property, ref) {
      var optionalValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      return __awaiter$1(this, void 0, void 0, function* () {
        if (this.META.property(property).relType !== "hasMany") {
          var e = new Error("The property \"".concat(property, "\" does NOT have a \"hasMany\" relationship on ").concat(this.modelName));
          e.name = "InvalidRelationship";
          throw e;
        }

        if (_typeof(this.data[property]) === "object" && this.data[property][ref]) {
          console.warn("The fk of \"".concat(ref, "\" already exists in \"").concat(this.modelName, ".").concat(property, "\"!"));
          return;
        }

        yield this.db.multiPathSet(this.dbPath).add({
          path: "".concat(property, "/").concat(ref, "/"),
          value: optionalValue
        }).add({
          path: "lastUpdated",
          value: new Date().getTime()
        }).execute();
      });
    }
    /**
     * Changes the local state of a property on the record
     *
     * @param prop the property on the record to be changed
     * @param value the new value to set to
     */

  }, {
    key: "set",
    value: function set(prop, value) {
      return __awaiter$1(this, void 0, void 0, function* () {
        // TODO: add interaction points for client-side state management; goal
        // is to have local state changed immediately but with meta data to indicate
        // that we're waiting for backend confirmation.
        this._data[prop] = value;
        yield this.db.multiPathSet(this.dbPath).add({
          path: "".concat(prop, "/"),
          value: value
        }).add({
          path: "lastUpdated/",
          value: new Date().getTime()
        }).execute();
        return;
      });
    }
    /**
     * get a property value from the record
     *
     * @param prop the property being retrieved
     */

  }, {
    key: "get",
    value: function get(prop) {
      return this.data[prop];
    }
  }, {
    key: "toString",
    value: function toString() {
      return "Record::".concat(this.modelName, "@").concat(this.id || "undefined");
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        dbPath: this.dbPath,
        modelName: this.modelName,
        pluralName: this.pluralName,
        key: this.id,
        localPath: this.localPath,
        data: this.data.toString()
      };
    }
    /**
     * Load data from a record in database
     */

  }, {
    key: "_getFromDB",
    value: function _getFromDB(id) {
      return __awaiter$1(this, void 0, void 0, function* () {
        if (!this.db) {
          var e = new Error("The attempt to load data into a Record requires that the DB property be initialized first!");
          e.name = "NoDatabase";
          throw e;
        }

        this._data.id = id;
        var data = yield this.db.getRecord(this.dbPath);

        if (data && data.id) {
          this._initialize(data);
        } else {
          throw new Error("Unknown Key: the key \"".concat(id, "\" was not found in Firebase at \"").concat(this.dbPath, "\"."));
        }

        return this;
      });
    }
  }, {
    key: "_save",
    value: function _save() {
      return __awaiter$1(this, void 0, void 0, function* () {
        if (this.id) {
          var e = new Error("Saving after ID is set is not allowed [ ".concat(this.id, " ]"));
          e.name = "InvalidSave";
          throw e;
        }

        this.id = firebaseKey.key();

        if (!this.db) {
          var _e = new Error("Attempt to save Record failed as the Database has not been connected yet. Try setting Model.defaultDb first.");

          _e.name = "FiremodelError";
          throw _e;
        }

        yield this.db.set(this.dbPath, this.data);
        return this;
      });
    }
  }, {
    key: "data",
    get: function get() {
      return this._data;
    }
  }, {
    key: "isDirty",
    get: function get() {
      return this._writeOperations.length > 0 ? true : false;
    }
  }, {
    key: "META",
    get: function get() {
      return this._model.schema.META;
    }
  }, {
    key: "db",
    get: function get() {
      return this._model.db;
    }
  }, {
    key: "pluralName",
    get: function get() {
      return this._model.pluralName;
    }
  }, {
    key: "pushKeys",
    get: function get() {
      return this._model.schema.META.pushKeys;
    }
    /**
     * returns the fully qualified name in the database to this record;
     * this of course includes the record id so if that's not set yet calling
     * this getter will result in an error
     */

  }, {
    key: "dbPath",
    get: function get() {
      if (!this.data.id) {
        throw commonTypes.createError("record/invalid-path", "Invalid Record Path: you can not ask for the dbPath before setting an \"id\" property.");
      }

      return [this.data.META.dbOffset, this.pluralName, this.data.id].join("/");
    }
  }, {
    key: "modelName",
    get: function get() {
      return this.data.constructor.name.toLowerCase();
    }
    /** The Record's primary key */

  }, {
    key: "id",
    get: function get() {
      return this.data.id;
    },
    set: function set(val) {
      if (this.data.id) {
        var e = new Error("You may not re-set the ID of a record [ ".concat(this.data.id, " \u2192 ").concat(val, " ]."));
        e.name = "NotAllowed";
        throw e;
      }

      this._data.id = val;
    }
    /**
     * returns the record's database offset without including the ID of the record;
     * among other things this can be useful prior to establishing an ID for a record
     */

  }, {
    key: "dbOffset",
    get: function get() {
      return this.data.META.dbOffset;
    }
    /**
     * returns the record's location in the frontend state management framework;
     * depends on appropriate configuration of model to be accurate.
     */

  }, {
    key: "localPath",
    get: function get() {
      if (!this.data.id) {
        throw new Error('Invalid Path: you can not ask for the dbPath before setting an "id" property.');
      }

      return [this.data.META.localOffset, this.pluralName, this.data.id].join("/");
    }
  }, {
    key: "existsOnDB",
    get: function get() {
      return this.data && this.data.id ? true : false;
    }
  }], [{
    key: "create",
    value: function create(schema) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var model = Model$$1.create(schema, options);
      var record = new Record(model, options);
      return record;
    }
    /**
     * add
     *
     * Adds a new record to the database
     *
     * @param schema the schema of the record
     * @param newRecord the data for the new record
     * @param options
     */

  }, {
    key: "add",
    value: function add(schema, newRecord) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return __awaiter$1(this, void 0, void 0, function* () {
        var r;

        try {
          r = Record.create(schema, options);

          r._initialize(newRecord);

          yield r._save();
        } catch (e) {
          var err = new Error("Problem adding new Record: ".concat(e.message));
          err.name = e.name !== "Error" ? e.name : "FiremodelError";
          throw e;
        }

        return r;
      });
    }
    /**
     * load
     *
     * static method to create a Record when you want to load the
     * state of the record with something you already have.
     *
     * Intent should be that this record already exists in the
     * database. If you want to add to the database then use add()
     */

  }, {
    key: "load",
    value: function load(schema, record) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var r = Record.create(schema, options);

      r._initialize(record);

      return r;
    }
  }, {
    key: "get",
    value: function get(schema, id) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return __awaiter$1(this, void 0, void 0, function* () {
        var record = Record.create(schema, options);
        yield record._getFromDB(id);
        return record;
      });
    }
  }]);

  return Record;
}();

var __awaiter$2 = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : new P(function (resolve) {
        resolve(result.value);
      }).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var DEFAULT_IF_NOT_FOUND = "__DO_NOT_USE__";
var List$$1 =
/*#__PURE__*/
function () {
  function List$$1(_model) {
    var _data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    _classCallCheck(this, List$$1);

    this._model = _model;
    this._data = _data;
  }

  _createClass(List$$1, [{
    key: "filter",

    /** Returns another List with data filtered down by passed in filter function */
    value: function filter(f) {
      return new List$$1(this._model, this._data.filter(f));
    }
    /** Returns another List with data filtered down by passed in filter function */

  }, {
    key: "find",
    value: function find(f) {
      var defaultIfNotFound = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_IF_NOT_FOUND;

      var filtered = this._data.filter(f);

      var r = Record.create(this._model.schemaClass);

      if (filtered.length > 0) {
        r._initialize(filtered[0]);

        return r;
      } else {
        if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
          return defaultIfNotFound;
        } else {
          var e = new Error("find(fn) did not find a value in the List [ length: ".concat(this.data.length, " ]"));
          e.name = "NotFound";
          throw e;
        }
      }
    }
  }, {
    key: "filterWhere",
    value: function filterWhere(prop, value) {
      var whereFilter = function whereFilter(item) {
        return item[prop] === value;
      };

      return new List$$1(this._model, this._data.filter(whereFilter));
    }
    /**
     * findWhere
     *
     * returns the first record in the list where the property equals the
     * specified value. If no value is found then an error is thrown unless
     * it is stated
     */

  }, {
    key: "findWhere",
    value: function findWhere(prop, value) {
      var defaultIfNotFound = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_IF_NOT_FOUND;
      console.log(this._data);
      var list = this.filterWhere(prop, value);

      if (list.length > 0) {
        return Record.load(this._model.schemaClass, list._data[0]);
      } else {
        if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
          return defaultIfNotFound;
        } else {
          var e = new Error("findWhere(".concat(prop, ", ").concat(value, ") was not found in the List [ length: ").concat(this.data.length, " ]"));
          e.name = "NotFound";
          throw e;
        }
      }
    }
    /**
     * provides a map over the data structured managed by the List; there will be no mutations to the
     * data managed by the list
     */

  }, {
    key: "map",
    value: function map(f) {
      return this.data.map(f);
    }
  }, {
    key: "get",

    /**
     * Returns the specified record Record object
     *
     * @param id the unique ID which is being looked for
     * @param defaultIfNotFound the default value returned if the ID is not found in the list
     */
    value: function get(id) {
      var defaultIfNotFound = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_IF_NOT_FOUND;
      var find = this.filter(function (f) {
        return f.id === id;
      });

      if (find.length === 0) {
        if (defaultIfNotFound !== DEFAULT_IF_NOT_FOUND) {
          return defaultIfNotFound;
        }

        var e = new Error("Could not find \"".concat(id, "\" in list of ").concat(this._model.pluralName));
        e.name = "NotFound";
        throw e;
      }

      var r = new Record(this._model);

      r._initialize(find.data[0]);

      return r;
    }
    /**
     * Returns the single instance of an object contained by the List container
     *
     * @param id the unique ID which is being looked for
     * @param defaultIfNotFound the default value returned if the ID is not found in the list
     */

  }, {
    key: "getData",
    value: function getData(id) {
      var defaultIfNotFound = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "__DO_NOT_USE__";
      var record = this.get(id, defaultIfNotFound);
      return record === defaultIfNotFound ? defaultIfNotFound : record.data;
    }
  }, {
    key: "load",
    value: function load(pathOrQuery) {
      return __awaiter$2(this, void 0, void 0, function* () {
        if (!this.db) {
          var e = new Error("The attempt to load data into a List requires that the DB property be initialized first!");
          e.name = "NoDatabase";
          throw e;
        }

        this._data = yield this.db.getList(pathOrQuery);
        return this;
      });
    }
  }, {
    key: "length",
    get: function get() {
      return this._data.length;
    }
  }, {
    key: "db",
    get: function get() {
      return this._model.db;
    }
  }, {
    key: "modelName",
    get: function get() {
      return this._model.modelName;
    }
  }, {
    key: "pluralName",
    get: function get() {
      return this._model.pluralName;
    }
  }, {
    key: "dbPath",
    get: function get() {
      return [this.meta.dbOffset, this.pluralName].join("/");
    }
  }, {
    key: "localPath",
    get: function get() {
      return [this.meta.localOffset, this.pluralName].join("/");
    }
  }, {
    key: "meta",
    get: function get() {
      return this._model.schema.META;
    }
  }, {
    key: "data",
    get: function get() {
      return this._data;
    }
  }], [{
    key: "create",
    value: function create(schema$$1) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var model = Model$$1.create(schema$$1, options);
      return new List$$1(model);
    }
    /**
     * Creates a List<T> which is populated with the passed in query
     *
     * @param schema the schema type
     * @param query the serialized query; note that this LIST will override the path of the query
     * @param options model options
     */

  }, {
    key: "fromQuery",
    value: function fromQuery(schema$$1, query) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return __awaiter$2(this, void 0, void 0, function* () {
        var model = Model$$1.create(schema$$1, options);
        query.setPath(model.dbPath);
        var list = List$$1.create(schema$$1, options);
        yield list.load(query);
        return list;
      });
    }
    /**
     * Loads all the records of a given schema-type ordered by lastUpdated
     *
     * @param schema the schema type
     * @param options model options
     */

  }, {
    key: "all",
    value: function all(schema$$1) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return __awaiter$2(this, void 0, void 0, function* () {
        var query = new serializedQuery.SerializedQuery().orderByChild("lastUpdated");
        var list = yield List$$1.fromQuery(schema$$1, query, options);
        return list;
      });
    }
    /**
     * Loads the first X records of the Schema type where
     * ordering is provided by the "createdAt" property
     *
     * @param schema the schema type
     * @param howMany the number of records to bring back
     * @param options model options
     */

  }, {
    key: "first",
    value: function first(schema$$1, howMany) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return __awaiter$2(this, void 0, void 0, function* () {
        var query = new serializedQuery.SerializedQuery().orderByChild("createdAt").limitToLast(howMany);
        var list = yield List$$1.fromQuery(schema$$1, query, options);
        return list;
      });
    }
    /**
     * recent
     *
     * Get recent items of a given type/schema (based on lastUpdated)
     *
     * @param schema the TYPE you are interested
     * @param howMany the quantity to of records to bring back
     * @param offset start at an offset position (useful for paging)
     * @param options
     */

  }, {
    key: "recent",
    value: function recent(schema$$1, howMany) {
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      return __awaiter$2(this, void 0, void 0, function* () {
        var query = new serializedQuery.SerializedQuery().orderByChild("lastUpdated").limitToFirst(howMany);
        var list = yield List$$1.fromQuery(schema$$1, query, options);
        return list;
      });
    }
    /**
     * since
     *
     * Bring back all records that have changed since a given date
     *
     * @param schema the TYPE you are interested
     * @param since  the datetime in miliseconds
     * @param options
     */

  }, {
    key: "since",
    value: function since(schema$$1, _since) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return __awaiter$2(this, void 0, void 0, function* () {
        if (typeof _since !== "number") {
          var e = new Error("Invalid \"since\" parameter; value must be number instead got a(n) ".concat(_typeof(_since), " [ ").concat(_since, " ]"));
          e.name = "NotAllowed";
          throw e;
        } // const query = new SerializedQuery().orderByChild("lastUpdated").startAt(since);


        var query = new serializedQuery.SerializedQuery().orderByChild("lastUpdated").startAt(_since);
        console.log("QUERY", query);
        var list = yield List$$1.fromQuery(schema$$1, query, options);
        return list;
      });
    }
  }, {
    key: "inactive",
    value: function inactive(schema$$1, howMany) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return __awaiter$2(this, void 0, void 0, function* () {
        var query = new serializedQuery.SerializedQuery().orderByChild("lastUpdated").limitToLast(howMany);
        var list = yield List$$1.fromQuery(schema$$1, query, options);
        return list;
      });
    }
  }, {
    key: "last",
    value: function last(schema$$1, howMany) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return __awaiter$2(this, void 0, void 0, function* () {
        var query = new serializedQuery.SerializedQuery().orderByChild("createdAt").limitToFirst(howMany);
        var list = yield List$$1.fromQuery(schema$$1, query, options);
        return list;
      });
    }
  }, {
    key: "where",
    value: function where(schema$$1, property$$1, value) {
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      return __awaiter$2(this, void 0, void 0, function* () {
        var operation = "=";
        var val = value;

        if (Array.isArray(value)) {
          val = value[1];
          operation = value[0];
        }

        var query = new serializedQuery.SerializedQuery().orderByChild(property$$1).where(operation, val);
        var list = yield List$$1.fromQuery(schema$$1, query, options);
        return list;
      });
    }
  }]);

  return List$$1;
}();

exports.fbKey = firebaseKey.key;
exports.property = property;
exports.pushKey = pushKey;
exports.constrainedProperty = constrainedProperty;
exports.constrain = constrain;
exports.min = min;
exports.max = max;
exports.length = length;
exports.desc = desc;
exports.hasMany = hasMany;
exports.ownedBy = ownedBy;
exports.inverse = inverse;
exports.schema = schema;
exports.BaseSchema = BaseSchema;
exports.Model = Model$$1;
exports.Record = Record;
exports.List = List$$1;
