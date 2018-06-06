(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.firemodel = {})));
}(this, (function (exports) { 'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

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

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var common_types_1 = require("common-types");

	var VerboseError_1 = require("./VerboseError");

	var index_1 = require("./index");

	var pluralize = require("pluralize");

	var camelCase = require("lodash.camelcase");

	var serialized_query_1 = require("serialized-query");

	var util_1 = require("./util");

	var firebase_key_1 = require("firebase-key");

	exports.baseLogger = {
	  log: function log(message) {
	    return console.log("".concat(_this.modelName, "/").concat(_this._key, ": ").concat(message));
	  },
	  warn: function warn(message) {
	    return console.warn("".concat(_this.modelName, "/").concat(_this._key, ": ").concat(message));
	  },
	  debug: function debug(message) {
	    var stage = process.env.STAGE || process.env.AWS_STAGE || process.env.ENV;

	    if (stage !== "prod") {
	      console.log("".concat(_this.modelName, "/").concat(_this._key, ": ").concat(message));
	    }
	  },
	  error: function error(message) {
	    return console.error("".concat(_this.modelName, "/").concat(_this._key, ": ").concat(message));
	  }
	};

	var Model =
	/*#__PURE__*/
	function () {
	  //#endregion
	  function Model(_schemaClass, db, logger) {
	    var _this2 = this;

	    _classCallCheck(this, Model);

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

	    if (!Model.defaultDb) {
	      Model.defaultDb = db;
	    }

	    this.logger = logger ? logger : exports.baseLogger;
	    this._schema = new this.schemaClass();
	  }

	  _createClass(Model, [{
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
	        var record = yield index_1.Record.get(this._schemaClass, id);
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
	        var list = new index_1.List(this);
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
	          var record = index_1.Record.get(this._schemaClass, first.id);
	          return record;
	        } else {
	          throw common_types_1.createError("not-found", "Not Found: didn't find any \"".concat(this.pluralName, "\" which had \"").concat(prop, "\" set to \"").concat(value, "\"; note the path in the database which was searched was \"").concat(this.dbPath, "\"."));
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
	          throw common_types_1.createError("model/findAll", "\nFailed getting via getList() with query" + JSON.stringify(query, null, 2), e);
	        }

	        return new index_1.List(this, results);
	      });
	    }
	    /** sets a record to the database */

	  }, {
	    key: "set",
	    value: function set(record) {
	      var auditInfo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      return __awaiter(this, void 0, void 0, function* () {
	        if (!record.id) {
	          throw common_types_1.createError("set/no-id", "Attempt to set \"".concat(this.dbPath, "\" in database but record had no \"id\" property."));
	        }

	        var now = this.now();
	        record = Object.assign({}, record, {
	          lastUpdated: now
	        });
	        auditInfo = Object.assign({}, auditInfo, {
	          properties: Object.keys(record)
	        });
	        var ref = yield this.crud("set", now, util_1.slashNotation(this.dbPath, record.id), record, auditInfo);
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
	        var id = firebase_key_1.key();
	        newRecord = Object.assign({}, newRecord, {
	          lastUpdated: now,
	          createdAt: now
	        });
	        auditInfo = Object.assign({}, auditInfo, {
	          properties: Object.keys(newRecord)
	        });
	        var ref = yield this.crud("push", now, util_1.slashNotation(this.dbPath, id), newRecord, auditInfo);
	        return index_1.Record.get(this._schemaClass, id);
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
	        yield this.crud("update", now, util_1.slashNotation(this.dbPath, key), updates, auditInfo);
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
	          value = yield this._db.getValue(util_1.slashNotation(this.dbPath, key));
	        }

	        yield this.crud("remove", now, key.match(this.dbPath) ? key : util_1.slashNotation(this.dbPath, key), null, auditInfo);
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
	        var path = "".concat(Model.auditBase, "/").concat(this.pluralName);
	        var query = serialized_query_1.SerializedQuery.path(path);

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
	        var path = util_1.slashNotation(Model.auditBase, this.pluralName);
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
	        var auditPath = util_1.slashNotation(Model.auditBase, this.pluralName, key);
	        var auditRef;

	        if (isAuditable) {
	          console.log("auditing: ", op);
	          auditRef = yield this.audit(op, when, key, auditInfo);
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
	            throw new VerboseError_1.VerboseError({
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

	      var query = serialized_query_1.SerializedQuery.path(this.dbPath).orderByChild(child);

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
	          throw new VerboseError_1.VerboseError({
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
	      return camelCase(this._schema.constructor.name);
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
	    value: function create(schema) {
	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      var db = options.db || Model.defaultDb;
	      var logger = options.logger || exports.baseLogger;
	      var model = new Model(schema, db, logger);
	      return model;
	    }
	  }]);

	  return Model;
	}(); //#region PROPERTIES


	Model.defaultDb = null;
	/** The base path in the database to store audit logs */

	Model.auditBase = "logging/audit_logs";
	exports.default = Model;

	var model = /*#__PURE__*/Object.freeze({

	});

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	require("reflect-metadata");

	var decorator_1 = require("./decorator");

	function constrainedProperty() {
	  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	  return decorator_1.propertyDecorator(Object.assign({}, options, {
	    isRelationship: false,
	    isProperty: true
	  }), "property");
	}

	exports.constrainedProperty = constrainedProperty;
	/** allows the introduction of a new constraint to the metadata of a property */

	function constrain(prop, value) {
	  return decorator_1.propertyDecorator(_defineProperty({}, prop, value));
	}

	exports.constrain = constrain;

	function desc(value) {
	  return decorator_1.propertyDecorator({
	    desc: value
	  });
	}

	exports.desc = desc;

	function min(value) {
	  return decorator_1.propertyDecorator({
	    min: value
	  });
	}

	exports.min = min;

	function max(value) {
	  return decorator_1.propertyDecorator({
	    max: value
	  });
	}

	exports.max = max;

	function length(value) {
	  return decorator_1.propertyDecorator({
	    length: value
	  });
	}

	exports.length = length;
	exports.property = decorator_1.propertyDecorator({
	  isRelationship: false,
	  isProperty: true
	}, "property");
	exports.pushKey = decorator_1.propertyDecorator({
	  pushKey: true
	}, "property");

	var property = /*#__PURE__*/Object.freeze({

	});

	/*! *****************************************************************************
	Copyright (C) Microsoft. All rights reserved.
	Licensed under the Apache License, Version 2.0 (the "License"); you may not use
	this file except in compliance with the License. You may obtain a copy of the
	License at http://www.apache.org/licenses/LICENSE-2.0

	THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
	KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
	WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
	MERCHANTABLITY OR NON-INFRINGEMENT.

	See the Apache Version 2.0 License for specific language governing permissions
	and limitations under the License.
	***************************************************************************** */
	var Reflect$1;
	(function (Reflect) {
	    // Metadata Proposal
	    // https://rbuckton.github.io/reflect-metadata/
	    (function (factory) {
	        var root = typeof commonjsGlobal === "object" ? commonjsGlobal :
	            typeof self === "object" ? self :
	                typeof this === "object" ? this :
	                    Function("return this;")();
	        var exporter = makeExporter(Reflect);
	        if (typeof root.Reflect === "undefined") {
	            root.Reflect = Reflect;
	        }
	        else {
	            exporter = makeExporter(root.Reflect, exporter);
	        }
	        factory(exporter);
	        function makeExporter(target, previous) {
	            return function (key, value) {
	                if (typeof target[key] !== "function") {
	                    Object.defineProperty(target, key, { configurable: true, writable: true, value: value });
	                }
	                if (previous)
	                    previous(key, value);
	            };
	        }
	    })(function (exporter) {
	        var hasOwn = Object.prototype.hasOwnProperty;
	        // feature test for Symbol support
	        var supportsSymbol = typeof Symbol === "function";
	        var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
	        var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
	        var supportsCreate = typeof Object.create === "function"; // feature test for Object.create support
	        var supportsProto = { __proto__: [] } instanceof Array; // feature test for __proto__ support
	        var downLevel = !supportsCreate && !supportsProto;
	        var HashMap = {
	            // create an object in dictionary mode (a.k.a. "slow" mode in v8)
	            create: supportsCreate
	                ? function () { return MakeDictionary(Object.create(null)); }
	                : supportsProto
	                    ? function () { return MakeDictionary({ __proto__: null }); }
	                    : function () { return MakeDictionary({}); },
	            has: downLevel
	                ? function (map, key) { return hasOwn.call(map, key); }
	                : function (map, key) { return key in map; },
	            get: downLevel
	                ? function (map, key) { return hasOwn.call(map, key) ? map[key] : undefined; }
	                : function (map, key) { return map[key]; },
	        };
	        // Load global or shim versions of Map, Set, and WeakMap
	        var functionPrototype = Object.getPrototypeOf(Function);
	        var usePolyfill = typeof process === "object" && process.env && process.env["REFLECT_METADATA_USE_MAP_POLYFILL"] === "true";
	        var _Map = !usePolyfill && typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
	        var _Set = !usePolyfill && typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
	        var _WeakMap = !usePolyfill && typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
	        // [[Metadata]] internal slot
	        // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
	        var Metadata = new _WeakMap();
	        /**
	         * Applies a set of decorators to a property of a target object.
	         * @param decorators An array of decorators.
	         * @param target The target object.
	         * @param propertyKey (Optional) The property key to decorate.
	         * @param attributes (Optional) The property descriptor for the target key.
	         * @remarks Decorators are applied in reverse order.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     Example = Reflect.decorate(decoratorsArray, Example);
	         *
	         *     // property (on constructor)
	         *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     Object.defineProperty(Example, "staticMethod",
	         *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
	         *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
	         *
	         *     // method (on prototype)
	         *     Object.defineProperty(Example.prototype, "method",
	         *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
	         *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
	         *
	         */
	        function decorate(decorators, target, propertyKey, attributes) {
	            if (!IsUndefined(propertyKey)) {
	                if (!IsArray(decorators))
	                    throw new TypeError();
	                if (!IsObject(target))
	                    throw new TypeError();
	                if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
	                    throw new TypeError();
	                if (IsNull(attributes))
	                    attributes = undefined;
	                propertyKey = ToPropertyKey(propertyKey);
	                return DecorateProperty(decorators, target, propertyKey, attributes);
	            }
	            else {
	                if (!IsArray(decorators))
	                    throw new TypeError();
	                if (!IsConstructor(target))
	                    throw new TypeError();
	                return DecorateConstructor(decorators, target);
	            }
	        }
	        exporter("decorate", decorate);
	        // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
	        // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
	        /**
	         * A default metadata decorator factory that can be used on a class, class member, or parameter.
	         * @param metadataKey The key for the metadata entry.
	         * @param metadataValue The value for the metadata entry.
	         * @returns A decorator function.
	         * @remarks
	         * If `metadataKey` is already defined for the target and target key, the
	         * metadataValue for that key will be overwritten.
	         * @example
	         *
	         *     // constructor
	         *     @Reflect.metadata(key, value)
	         *     class Example {
	         *     }
	         *
	         *     // property (on constructor, TypeScript only)
	         *     class Example {
	         *         @Reflect.metadata(key, value)
	         *         static staticProperty;
	         *     }
	         *
	         *     // property (on prototype, TypeScript only)
	         *     class Example {
	         *         @Reflect.metadata(key, value)
	         *         property;
	         *     }
	         *
	         *     // method (on constructor)
	         *     class Example {
	         *         @Reflect.metadata(key, value)
	         *         static staticMethod() { }
	         *     }
	         *
	         *     // method (on prototype)
	         *     class Example {
	         *         @Reflect.metadata(key, value)
	         *         method() { }
	         *     }
	         *
	         */
	        function metadata(metadataKey, metadataValue) {
	            function decorator(target, propertyKey) {
	                if (!IsObject(target))
	                    throw new TypeError();
	                if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
	                    throw new TypeError();
	                OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
	            }
	            return decorator;
	        }
	        exporter("metadata", metadata);
	        /**
	         * Define a unique metadata entry on the target.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param metadataValue A value that contains attached metadata.
	         * @param target The target object on which to define metadata.
	         * @param propertyKey (Optional) The property key for the target.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     Reflect.defineMetadata("custom:annotation", options, Example);
	         *
	         *     // property (on constructor)
	         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
	         *
	         *     // decorator factory as metadata-producing annotation.
	         *     function MyAnnotation(options): Decorator {
	         *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
	         *     }
	         *
	         */
	        function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
	        }
	        exporter("defineMetadata", defineMetadata);
	        /**
	         * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.hasMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function hasMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryHasMetadata(metadataKey, target, propertyKey);
	        }
	        exporter("hasMetadata", hasMetadata);
	        /**
	         * Gets a value indicating whether the target object has the provided metadata key defined.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function hasOwnMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
	        }
	        exporter("hasOwnMetadata", hasOwnMetadata);
	        /**
	         * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.getMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function getMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryGetMetadata(metadataKey, target, propertyKey);
	        }
	        exporter("getMetadata", getMetadata);
	        /**
	         * Gets the metadata value for the provided metadata key on the target object.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function getOwnMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
	        }
	        exporter("getOwnMetadata", getOwnMetadata);
	        /**
	         * Gets the metadata keys defined on the target object or its prototype chain.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns An array of unique metadata keys.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.getMetadataKeys(Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.getMetadataKeys(Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.getMetadataKeys(Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.getMetadataKeys(Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.getMetadataKeys(Example.prototype, "method");
	         *
	         */
	        function getMetadataKeys(target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryMetadataKeys(target, propertyKey);
	        }
	        exporter("getMetadataKeys", getMetadataKeys);
	        /**
	         * Gets the unique metadata keys defined on the target object.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns An array of unique metadata keys.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.getOwnMetadataKeys(Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
	         *
	         */
	        function getOwnMetadataKeys(target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            return OrdinaryOwnMetadataKeys(target, propertyKey);
	        }
	        exporter("getOwnMetadataKeys", getOwnMetadataKeys);
	        /**
	         * Deletes the metadata entry from the target object with the provided key.
	         * @param metadataKey A key used to store and retrieve metadata.
	         * @param target The target object on which the metadata is defined.
	         * @param propertyKey (Optional) The property key for the target.
	         * @returns `true` if the metadata entry was found and deleted; otherwise, false.
	         * @example
	         *
	         *     class Example {
	         *         // property declarations are not part of ES6, though they are valid in TypeScript:
	         *         // static staticProperty;
	         *         // property;
	         *
	         *         constructor(p) { }
	         *         static staticMethod(p) { }
	         *         method(p) { }
	         *     }
	         *
	         *     // constructor
	         *     result = Reflect.deleteMetadata("custom:annotation", Example);
	         *
	         *     // property (on constructor)
	         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
	         *
	         *     // property (on prototype)
	         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
	         *
	         *     // method (on constructor)
	         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
	         *
	         *     // method (on prototype)
	         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
	         *
	         */
	        function deleteMetadata(metadataKey, target, propertyKey) {
	            if (!IsObject(target))
	                throw new TypeError();
	            if (!IsUndefined(propertyKey))
	                propertyKey = ToPropertyKey(propertyKey);
	            var metadataMap = GetOrCreateMetadataMap(target, propertyKey, /*Create*/ false);
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
	        function DecorateConstructor(decorators, target) {
	            for (var i = decorators.length - 1; i >= 0; --i) {
	                var decorator = decorators[i];
	                var decorated = decorator(target);
	                if (!IsUndefined(decorated) && !IsNull(decorated)) {
	                    if (!IsConstructor(decorated))
	                        throw new TypeError();
	                    target = decorated;
	                }
	            }
	            return target;
	        }
	        function DecorateProperty(decorators, target, propertyKey, descriptor) {
	            for (var i = decorators.length - 1; i >= 0; --i) {
	                var decorator = decorators[i];
	                var decorated = decorator(target, propertyKey, descriptor);
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
	                    return undefined;
	                targetMetadata = new _Map();
	                Metadata.set(O, targetMetadata);
	            }
	            var metadataMap = targetMetadata.get(P);
	            if (IsUndefined(metadataMap)) {
	                if (!Create)
	                    return undefined;
	                metadataMap = new _Map();
	                targetMetadata.set(P, metadataMap);
	            }
	            return metadataMap;
	        }
	        // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
	        function OrdinaryHasMetadata(MetadataKey, O, P) {
	            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
	            if (hasOwn)
	                return true;
	            var parent = OrdinaryGetPrototypeOf(O);
	            if (!IsNull(parent))
	                return OrdinaryHasMetadata(MetadataKey, parent, P);
	            return false;
	        }
	        // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
	        function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
	            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
	            if (IsUndefined(metadataMap))
	                return false;
	            return ToBoolean(metadataMap.has(MetadataKey));
	        }
	        // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
	        function OrdinaryGetMetadata(MetadataKey, O, P) {
	            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
	            if (hasOwn)
	                return OrdinaryGetOwnMetadata(MetadataKey, O, P);
	            var parent = OrdinaryGetPrototypeOf(O);
	            if (!IsNull(parent))
	                return OrdinaryGetMetadata(MetadataKey, parent, P);
	            return undefined;
	        }
	        // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
	        function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
	            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
	            if (IsUndefined(metadataMap))
	                return undefined;
	            return metadataMap.get(MetadataKey);
	        }
	        // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
	        function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
	            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
	            metadataMap.set(MetadataKey, MetadataValue);
	        }
	        // 3.1.6.1 OrdinaryMetadataKeys(O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
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
	            var set = new _Set();
	            var keys = [];
	            for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
	                var key = ownKeys_1[_i];
	                var hasKey = set.has(key);
	                if (!hasKey) {
	                    set.add(key);
	                    keys.push(key);
	                }
	            }
	            for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
	                var key = parentKeys_1[_a];
	                var hasKey = set.has(key);
	                if (!hasKey) {
	                    set.add(key);
	                    keys.push(key);
	                }
	            }
	            return keys;
	        }
	        // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
	        // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
	        function OrdinaryOwnMetadataKeys(O, P) {
	            var keys = [];
	            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
	            if (IsUndefined(metadataMap))
	                return keys;
	            var keysObj = metadataMap.keys();
	            var iterator = GetIterator(keysObj);
	            var k = 0;
	            while (true) {
	                var next = IteratorStep(iterator);
	                if (!next) {
	                    keys.length = k;
	                    return keys;
	                }
	                var nextValue = IteratorValue(next);
	                try {
	                    keys[k] = nextValue;
	                }
	                catch (e) {
	                    try {
	                        IteratorClose(iterator);
	                    }
	                    finally {
	                        throw e;
	                    }
	                }
	                k++;
	            }
	        }
	        // 6 ECMAScript Data Typ0es and Values
	        // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
	        function Type(x) {
	            if (x === null)
	                return 1 /* Null */;
	            switch (typeof x) {
	                case "undefined": return 0 /* Undefined */;
	                case "boolean": return 2 /* Boolean */;
	                case "string": return 3 /* String */;
	                case "symbol": return 4 /* Symbol */;
	                case "number": return 5 /* Number */;
	                case "object": return x === null ? 1 /* Null */ : 6 /* Object */;
	                default: return 6 /* Object */;
	            }
	        }
	        // 6.1.1 The Undefined Type
	        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
	        function IsUndefined(x) {
	            return x === undefined;
	        }
	        // 6.1.2 The Null Type
	        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
	        function IsNull(x) {
	            return x === null;
	        }
	        // 6.1.5 The Symbol Type
	        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
	        function IsSymbol(x) {
	            return typeof x === "symbol";
	        }
	        // 6.1.7 The Object Type
	        // https://tc39.github.io/ecma262/#sec-object-type
	        function IsObject(x) {
	            return typeof x === "object" ? x !== null : typeof x === "function";
	        }
	        // 7.1 Type Conversion
	        // https://tc39.github.io/ecma262/#sec-type-conversion
	        // 7.1.1 ToPrimitive(input [, PreferredType])
	        // https://tc39.github.io/ecma262/#sec-toprimitive
	        function ToPrimitive(input, PreferredType) {
	            switch (Type(input)) {
	                case 0 /* Undefined */: return input;
	                case 1 /* Null */: return input;
	                case 2 /* Boolean */: return input;
	                case 3 /* String */: return input;
	                case 4 /* Symbol */: return input;
	                case 5 /* Number */: return input;
	            }
	            var hint = PreferredType === 3 /* String */ ? "string" : PreferredType === 5 /* Number */ ? "number" : "default";
	            var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
	            if (exoticToPrim !== undefined) {
	                var result = exoticToPrim.call(input, hint);
	                if (IsObject(result))
	                    throw new TypeError();
	                return result;
	            }
	            return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
	        }
	        // 7.1.1.1 OrdinaryToPrimitive(O, hint)
	        // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
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
	            }
	            else {
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
	        // 7.1.2 ToBoolean(argument)
	        // https://tc39.github.io/ecma262/2016/#sec-toboolean
	        function ToBoolean(argument) {
	            return !!argument;
	        }
	        // 7.1.12 ToString(argument)
	        // https://tc39.github.io/ecma262/#sec-tostring
	        function ToString(argument) {
	            return "" + argument;
	        }
	        // 7.1.14 ToPropertyKey(argument)
	        // https://tc39.github.io/ecma262/#sec-topropertykey
	        function ToPropertyKey(argument) {
	            var key = ToPrimitive(argument, 3 /* String */);
	            if (IsSymbol(key))
	                return key;
	            return ToString(key);
	        }
	        // 7.2 Testing and Comparison Operations
	        // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
	        // 7.2.2 IsArray(argument)
	        // https://tc39.github.io/ecma262/#sec-isarray
	        function IsArray(argument) {
	            return Array.isArray
	                ? Array.isArray(argument)
	                : argument instanceof Object
	                    ? argument instanceof Array
	                    : Object.prototype.toString.call(argument) === "[object Array]";
	        }
	        // 7.2.3 IsCallable(argument)
	        // https://tc39.github.io/ecma262/#sec-iscallable
	        function IsCallable(argument) {
	            // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
	            return typeof argument === "function";
	        }
	        // 7.2.4 IsConstructor(argument)
	        // https://tc39.github.io/ecma262/#sec-isconstructor
	        function IsConstructor(argument) {
	            // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
	            return typeof argument === "function";
	        }
	        // 7.2.7 IsPropertyKey(argument)
	        // https://tc39.github.io/ecma262/#sec-ispropertykey
	        function IsPropertyKey(argument) {
	            switch (Type(argument)) {
	                case 3 /* String */: return true;
	                case 4 /* Symbol */: return true;
	                default: return false;
	            }
	        }
	        // 7.3 Operations on Objects
	        // https://tc39.github.io/ecma262/#sec-operations-on-objects
	        // 7.3.9 GetMethod(V, P)
	        // https://tc39.github.io/ecma262/#sec-getmethod
	        function GetMethod(V, P) {
	            var func = V[P];
	            if (func === undefined || func === null)
	                return undefined;
	            if (!IsCallable(func))
	                throw new TypeError();
	            return func;
	        }
	        // 7.4 Operations on Iterator Objects
	        // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
	        function GetIterator(obj) {
	            var method = GetMethod(obj, iteratorSymbol);
	            if (!IsCallable(method))
	                throw new TypeError(); // from Call
	            var iterator = method.call(obj);
	            if (!IsObject(iterator))
	                throw new TypeError();
	            return iterator;
	        }
	        // 7.4.4 IteratorValue(iterResult)
	        // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
	        function IteratorValue(iterResult) {
	            return iterResult.value;
	        }
	        // 7.4.5 IteratorStep(iterator)
	        // https://tc39.github.io/ecma262/#sec-iteratorstep
	        function IteratorStep(iterator) {
	            var result = iterator.next();
	            return result.done ? false : result;
	        }
	        // 7.4.6 IteratorClose(iterator, completion)
	        // https://tc39.github.io/ecma262/#sec-iteratorclose
	        function IteratorClose(iterator) {
	            var f = iterator["return"];
	            if (f)
	                f.call(iterator);
	        }
	        // 9.1 Ordinary Object Internal Methods and Internal Slots
	        // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
	        // 9.1.1.1 OrdinaryGetPrototypeOf(O)
	        // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
	        function OrdinaryGetPrototypeOf(O) {
	            var proto = Object.getPrototypeOf(O);
	            if (typeof O !== "function" || O === functionPrototype)
	                return proto;
	            // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
	            // Try to determine the superclass constructor. Compatible implementations
	            // must either set __proto__ on a subclass constructor to the superclass constructor,
	            // or ensure each class has a valid `constructor` property on its prototype that
	            // points back to the constructor.
	            // If this is not the same as Function.[[Prototype]], then this is definately inherited.
	            // This is the case when in ES6 or when using __proto__ in a compatible browser.
	            if (proto !== functionPrototype)
	                return proto;
	            // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
	            var prototype = O.prototype;
	            var prototypeProto = prototype && Object.getPrototypeOf(prototype);
	            if (prototypeProto == null || prototypeProto === Object.prototype)
	                return proto;
	            // If the constructor was not a function, then we cannot determine the heritage.
	            var constructor = prototypeProto.constructor;
	            if (typeof constructor !== "function")
	                return proto;
	            // If we have some kind of self-reference, then we cannot determine the heritage.
	            if (constructor === O)
	                return proto;
	            // we have a pretty good guess at the heritage.
	            return constructor;
	        }
	        // naive Map shim
	        function CreateMapPolyfill() {
	            var cacheSentinel = {};
	            var arraySentinel = [];
	            var MapIterator = (function () {
	                function MapIterator(keys, values, selector) {
	                    this._index = 0;
	                    this._keys = keys;
	                    this._values = values;
	                    this._selector = selector;
	                }
	                MapIterator.prototype["@@iterator"] = function () { return this; };
	                MapIterator.prototype[iteratorSymbol] = function () { return this; };
	                MapIterator.prototype.next = function () {
	                    var index = this._index;
	                    if (index >= 0 && index < this._keys.length) {
	                        var result = this._selector(this._keys[index], this._values[index]);
	                        if (index + 1 >= this._keys.length) {
	                            this._index = -1;
	                            this._keys = arraySentinel;
	                            this._values = arraySentinel;
	                        }
	                        else {
	                            this._index++;
	                        }
	                        return { value: result, done: false };
	                    }
	                    return { value: undefined, done: true };
	                };
	                MapIterator.prototype.throw = function (error) {
	                    if (this._index >= 0) {
	                        this._index = -1;
	                        this._keys = arraySentinel;
	                        this._values = arraySentinel;
	                    }
	                    throw error;
	                };
	                MapIterator.prototype.return = function (value) {
	                    if (this._index >= 0) {
	                        this._index = -1;
	                        this._keys = arraySentinel;
	                        this._values = arraySentinel;
	                    }
	                    return { value: value, done: true };
	                };
	                return MapIterator;
	            }());
	            return (function () {
	                function Map() {
	                    this._keys = [];
	                    this._values = [];
	                    this._cacheKey = cacheSentinel;
	                    this._cacheIndex = -2;
	                }
	                Object.defineProperty(Map.prototype, "size", {
	                    get: function () { return this._keys.length; },
	                    enumerable: true,
	                    configurable: true
	                });
	                Map.prototype.has = function (key) { return this._find(key, /*insert*/ false) >= 0; };
	                Map.prototype.get = function (key) {
	                    var index = this._find(key, /*insert*/ false);
	                    return index >= 0 ? this._values[index] : undefined;
	                };
	                Map.prototype.set = function (key, value) {
	                    var index = this._find(key, /*insert*/ true);
	                    this._values[index] = value;
	                    return this;
	                };
	                Map.prototype.delete = function (key) {
	                    var index = this._find(key, /*insert*/ false);
	                    if (index >= 0) {
	                        var size = this._keys.length;
	                        for (var i = index + 1; i < size; i++) {
	                            this._keys[i - 1] = this._keys[i];
	                            this._values[i - 1] = this._values[i];
	                        }
	                        this._keys.length--;
	                        this._values.length--;
	                        if (key === this._cacheKey) {
	                            this._cacheKey = cacheSentinel;
	                            this._cacheIndex = -2;
	                        }
	                        return true;
	                    }
	                    return false;
	                };
	                Map.prototype.clear = function () {
	                    this._keys.length = 0;
	                    this._values.length = 0;
	                    this._cacheKey = cacheSentinel;
	                    this._cacheIndex = -2;
	                };
	                Map.prototype.keys = function () { return new MapIterator(this._keys, this._values, getKey); };
	                Map.prototype.values = function () { return new MapIterator(this._keys, this._values, getValue); };
	                Map.prototype.entries = function () { return new MapIterator(this._keys, this._values, getEntry); };
	                Map.prototype["@@iterator"] = function () { return this.entries(); };
	                Map.prototype[iteratorSymbol] = function () { return this.entries(); };
	                Map.prototype._find = function (key, insert) {
	                    if (this._cacheKey !== key) {
	                        this._cacheIndex = this._keys.indexOf(this._cacheKey = key);
	                    }
	                    if (this._cacheIndex < 0 && insert) {
	                        this._cacheIndex = this._keys.length;
	                        this._keys.push(key);
	                        this._values.push(undefined);
	                    }
	                    return this._cacheIndex;
	                };
	                return Map;
	            }());
	            function getKey(key, _) {
	                return key;
	            }
	            function getValue(_, value) {
	                return value;
	            }
	            function getEntry(key, value) {
	                return [key, value];
	            }
	        }
	        // naive Set shim
	        function CreateSetPolyfill() {
	            return (function () {
	                function Set() {
	                    this._map = new _Map();
	                }
	                Object.defineProperty(Set.prototype, "size", {
	                    get: function () { return this._map.size; },
	                    enumerable: true,
	                    configurable: true
	                });
	                Set.prototype.has = function (value) { return this._map.has(value); };
	                Set.prototype.add = function (value) { return this._map.set(value, value), this; };
	                Set.prototype.delete = function (value) { return this._map.delete(value); };
	                Set.prototype.clear = function () { this._map.clear(); };
	                Set.prototype.keys = function () { return this._map.keys(); };
	                Set.prototype.values = function () { return this._map.values(); };
	                Set.prototype.entries = function () { return this._map.entries(); };
	                Set.prototype["@@iterator"] = function () { return this.keys(); };
	                Set.prototype[iteratorSymbol] = function () { return this.keys(); };
	                return Set;
	            }());
	        }
	        // naive WeakMap shim
	        function CreateWeakMapPolyfill() {
	            var UUID_SIZE = 16;
	            var keys = HashMap.create();
	            var rootKey = CreateUniqueKey();
	            return (function () {
	                function WeakMap() {
	                    this._key = CreateUniqueKey();
	                }
	                WeakMap.prototype.has = function (target) {
	                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
	                    return table !== undefined ? HashMap.has(table, this._key) : false;
	                };
	                WeakMap.prototype.get = function (target) {
	                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
	                    return table !== undefined ? HashMap.get(table, this._key) : undefined;
	                };
	                WeakMap.prototype.set = function (target, value) {
	                    var table = GetOrCreateWeakMapTable(target, /*create*/ true);
	                    table[this._key] = value;
	                    return this;
	                };
	                WeakMap.prototype.delete = function (target) {
	                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
	                    return table !== undefined ? delete table[this._key] : false;
	                };
	                WeakMap.prototype.clear = function () {
	                    // NOTE: not a real clear, just makes the previous data unreachable
	                    this._key = CreateUniqueKey();
	                };
	                return WeakMap;
	            }());
	            function CreateUniqueKey() {
	                var key;
	                do
	                    key = "@@WeakMap@@" + CreateUUID();
	                while (HashMap.has(keys, key));
	                keys[key] = true;
	                return key;
	            }
	            function GetOrCreateWeakMapTable(target, create) {
	                if (!hasOwn.call(target, rootKey)) {
	                    if (!create)
	                        return undefined;
	                    Object.defineProperty(target, rootKey, { value: HashMap.create() });
	                }
	                return target[rootKey];
	            }
	            function FillRandomBytes(buffer, size) {
	                for (var i = 0; i < size; ++i)
	                    buffer[i] = Math.random() * 0xff | 0;
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
	                // mark as random - RFC 4122 § 4.4
	                data[6] = data[6] & 0x4f | 0x40;
	                data[8] = data[8] & 0xbf | 0x80;
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
	        // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
	        function MakeDictionary(obj) {
	            obj.__ = undefined;
	            delete obj.__;
	            return obj;
	        }
	    });
	})(Reflect$1 || (Reflect$1 = {}));

	var _this$1 = undefined;

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	require("reflect-metadata");

	var set$1 = require("lodash.set");

	var get = require("lodash.get");

	function push(target, path, value) {
	  if (Array.isArray(get(target, path))) {
	    get(target, path).push(value);
	  } else {
	    set$1(target, path, [value]);
	  }
	}
	/** Properties accumlated by propertyDecorators and grouped by schema */


	var propertiesBySchema = {};
	/** Relationships accumlated by propertyDecorators and grouped by schema */

	var relationshipsBySchema = {};

	exports.propertyDecorator = function () {
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
	    var _val = _this$1[key];

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

	exports.getProperties = getProperties;

	function getRelationships(target) {
	  return relationshipsBySchema[target.constructor.name];
	}

	exports.getRelationships = getRelationships;

	function getPushKeys(target) {
	  var props = getProperties(target);
	  return props.filter(function (p) {
	    return p.pushKey;
	  }).map(function (p) {
	    return p.property;
	  });
	}

	exports.getPushKeys = getPushKeys;

	var decorator_1$1 = /*#__PURE__*/Object.freeze({

	});

	var relationship = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});





	function hasMany(schemaClass) {
	  return decorator_1$1.propertyDecorator({
	    isRelationship: true,
	    isProperty: false,
	    relType: 'hasMany'
	  }, 'property');
	}

	exports.hasMany = hasMany;

	function ownedBy(schemaClass) {
	  return decorator_1$1.propertyDecorator({
	    isRelationship: true,
	    isProperty: false,
	    relType: 'ownedBy'
	  }, 'property');
	}

	exports.ownedBy = ownedBy;

	function inverse(inverseProperty) {
	  return decorator_1$1.propertyDecorator({
	    inverseProperty: inverseProperty
	  });
	}

	exports.inverse = inverse;
	});

	unwrapExports(relationship);
	var relationship_1 = relationship.hasMany;
	var relationship_2 = relationship.ownedBy;
	var relationship_3 = relationship.inverse;

	var schema_1 = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});




	/** lookup meta data for schema properties */


	function propertyMeta(context) {
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
	            property: propertyMeta(obj)
	          }, {
	            properties: decorator_1$1.getProperties(obj)
	          }, {
	            relationships: decorator_1$1.getRelationships(obj)
	          }, {
	            pushKeys: decorator_1$1.getPushKeys(obj)
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

	exports.schema = schema;
	});

	unwrapExports(schema_1);
	var schema_2 = schema_1.schema;

	var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
	  var c = arguments.length,
	      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
	      d;
	  if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) {
	    if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	  }
	  return c > 3 && r && Object.defineProperty(target, key, r), r;
	};

	var __metadata = undefined && undefined.__metadata || function (k, v) {
	  if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var property_1 = require("./decorators/property");

	var RelationshipPolicy;

	(function (RelationshipPolicy) {
	  RelationshipPolicy["keys"] = "keys";
	  RelationshipPolicy["lazy"] = "lazy";
	  RelationshipPolicy["inline"] = "inline";
	})(RelationshipPolicy = exports.RelationshipPolicy || (exports.RelationshipPolicy = {}));

	var RelationshipCardinality;

	(function (RelationshipCardinality) {
	  RelationshipCardinality["hasMany"] = "hasMany";
	  RelationshipCardinality["belongsTo"] = "belongsTo";
	})(RelationshipCardinality = exports.RelationshipCardinality || (exports.RelationshipCardinality = {}));

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

	__decorate([property_1.property, __metadata("design:type", String)], BaseSchema.prototype, "id", void 0);

	__decorate([property_1.property, __metadata("design:type", Number)], BaseSchema.prototype, "lastUpdated", void 0);

	__decorate([property_1.property, __metadata("design:type", Number)], BaseSchema.prototype, "createdAt", void 0);

	exports.BaseSchema = BaseSchema;

	var baseSchema = /*#__PURE__*/Object.freeze({

	});

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

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var common_types_1$1 = require("common-types");

	var model_1 = require("./model");

	var firebase_key_1$1 = require("firebase-key");

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

	  _createClass(Record, [{
	    key: "initialize",

	    /**
	     * Allows an empty Record to be initialized to a known state.
	     * This is not intended to allow for mass property manipulation other
	     * than at time of initialization
	     *
	     * @param data the initial state you want to start with
	     */
	    value: function initialize(data) {
	      return __awaiter$1(this, void 0, void 0, function* () {
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

	        if (!this.id) {
	          this._save();
	        }
	      });
	    }
	  }, {
	    key: "load",

	    /**
	     * Load data from a record in database
	     */
	    value: function load(id) {
	      return __awaiter$1(this, void 0, void 0, function* () {
	        if (!this.db) {
	          var e = new Error("The attempt to load data into a Record requires that the DB property be initialized first!");
	          e.name = "NoDatabase";
	          throw e;
	        }

	        this._data.id = id;
	        var data = yield this.db.getRecord(this.dbPath);

	        if (data && data.id) {
	          this.initialize(data);
	        } else {
	          throw new Error("Unknown Key: the key \"".concat(id, "\" was not found in Firebase at \"").concat(this.dbPath, "\"."));
	        }

	        return this;
	      });
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
	          throw common_types_1$1.createError("invalid-operation/not-pushkey", "Invalid Operation: you can not push to property \"".concat(property, "\" as it has not been declared a pushKey property in the schema"));
	        }

	        if (!this.existsOnDB) {
	          throw common_types_1$1.createError("invalid-operation/not-on-db", "Invalid Operation: you can not push to property \"".concat(property, "\" before saving the record to the database"));
	        }

	        var key = firebase_key_1$1.key();
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
	          throw common_types_1$1.createError("multi-path/write-error", "", e);
	        }

	        return key;
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
	          path: "lastUpdated",
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
	  }, {
	    key: "_save",
	    value: function _save() {
	      return __awaiter$1(this, void 0, void 0, function* () {
	        if (this.id) {
	          var e = new Error("Saving after ID is set is not allowed [ ".concat(this.id, " ]"));
	          e.name = "InvalidSave";
	          throw e;
	        }

	        this.id = firebase_key_1$1.key();
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
	        throw common_types_1$1.createError("record/invalid-path", "Invalid Record Path: you can not ask for the dbPath before setting an \"id\" property.");
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
	      var model = model_1.default.create(schema, options);
	      var record = new Record(model, options);
	      return record;
	    }
	  }, {
	    key: "add",
	    value: function add(schema, newRecord) {
	      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	      return __awaiter$1(this, void 0, void 0, function* () {
	        // const r = new Record(schema, options);
	        var r = Record.create(schema, options);
	        yield r.initialize(newRecord);
	        return r;
	      });
	    }
	  }, {
	    key: "get",
	    value: function get(schema, id) {
	      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	      return __awaiter$1(this, void 0, void 0, function* () {
	        var record = Record.create(schema, options);
	        yield record.load(id);
	        return record;
	      });
	    }
	  }]);

	  return Record;
	}();

	exports.Record = Record;

	var record = /*#__PURE__*/Object.freeze({

	});

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

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var index_1$1 = require("./index");

	var serialized_query_1$1 = require("serialized-query");

	var model_1$1 = require("./model");

	var List =
	/*#__PURE__*/
	function () {
	  function List(_model) {
	    var _data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

	    _classCallCheck(this, List);

	    this._model = _model;
	    this._data = _data;
	  }

	  _createClass(List, [{
	    key: "filter",

	    /** Returns another List with data filtered down by passed in filter function */
	    value: function filter(f) {
	      return new List(this._model, this._data.filter(f));
	    }
	    /** Returns another List with data filtered down by passed in filter function */

	  }, {
	    key: "find",
	    value: function find(f) {
	      var filtered = this._data.filter(f);

	      return filtered.length > 0 ? index_1$1.Record.add(this._model.schemaClass, filtered[0]) : null;
	    }
	    /** Maps the data in the list to a plain JS object. Note: maintaining a List container isn't practical as the transformed data structure might not be a defined schema type */

	  }, {
	    key: "map",
	    value: function map(f) {
	      return this._data.map(f);
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
	    value: function create(schema) {
	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      var model = model_1$1.default.create(schema, options);
	      return new List(model);
	    }
	    /**
	     * Creates a List<T> which is populated with the passed in query
	     *
	     * @param schema the schema type
	     * @param query the serialized query; note that this LIST will override the path of the query
	     * @param options model options
	     */

	  }, {
	    key: "from",
	    value: function from(schema, query) {
	      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	      return __awaiter$2(this, void 0, void 0, function* () {
	        var model = model_1$1.default.create(schema, options);
	        query.setPath(model.dbPath);
	        var list = List.create(schema, options);
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
	    value: function all(schema) {
	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      return __awaiter$2(this, void 0, void 0, function* () {
	        var query = new serialized_query_1$1.SerializedQuery().orderByChild("lastUpdated");
	        var list = yield List.from(schema, query, options);
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
	    value: function first(schema, howMany) {
	      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	      return __awaiter$2(this, void 0, void 0, function* () {
	        var query = new serialized_query_1$1.SerializedQuery().orderByChild("createdAt").limitToLast(howMany);
	        var list = yield List.from(schema, query, options);
	        return list;
	      });
	    }
	  }, {
	    key: "recent",
	    value: function recent(schema, howMany) {
	      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	      return __awaiter$2(this, void 0, void 0, function* () {
	        var query = new serialized_query_1$1.SerializedQuery().orderByChild("lastUpdated").limitToFirst(howMany);
	        var list = yield List.from(schema, query, options);
	        return list;
	      });
	    }
	  }, {
	    key: "inactive",
	    value: function inactive(schema, howMany) {
	      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	      return __awaiter$2(this, void 0, void 0, function* () {
	        var query = new serialized_query_1$1.SerializedQuery().orderByChild("lastUpdated").limitToLast(howMany);
	        var list = yield List.from(schema, query, options);
	        return list;
	      });
	    }
	  }, {
	    key: "last",
	    value: function last(schema, howMany) {
	      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	      return __awaiter$2(this, void 0, void 0, function* () {
	        var query = new serialized_query_1$1.SerializedQuery().orderByChild("createdAt").limitToFirst(howMany);
	        var list = yield List.from(schema, query, options);
	        return list;
	      });
	    }
	  }, {
	    key: "where",
	    value: function where(schema, property, value) {
	      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
	      return __awaiter$2(this, void 0, void 0, function* () {
	        var operation = "=";
	        var val = value;

	        if (Array.isArray(value)) {
	          val = value[1];
	          operation = value[0];
	        }

	        var query = new serialized_query_1$1.SerializedQuery().orderByChild(property).where(operation, val);
	        var list = yield List.from(schema, query, options);
	        return list;
	      });
	    }
	  }]);

	  return List;
	}();

	exports.List = List;

	var list = /*#__PURE__*/Object.freeze({

	});

	var alphabet = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";

	function milliseconds(key) {
	    var result = 0;
	    for (var i = 0; i < 8; ++i) {
	        var index = alphabet.indexOf(key.charAt(i));
	        if (index === -1) {
	            throw new Error("Unexpected character '" + key.charAt(i) + "'.");
	        }
	        result = (result * 64) + index;
	    }
	    return result;
	}

	function date(key) {
	    return new Date(milliseconds(key));
	}

	function decode(component) {
	    return component.replace(/!([0-9a-f]{2})/gi, function (match, code) { return String.fromCharCode(parseInt(code, 16)); });
	}

	function decodeLexicographic(key) {
	    var value = 0;
	    var lengthChar = key.charAt(0);
	    if (lengthChar > "_") {
	        for (var k = 1; k < key.length; k++) {
	            value *= alphabet.length;
	            value += alphabet.indexOf(key.charAt(k));
	        }
	    }
	    else {
	        for (var k = 1; k < key.length; k++) {
	            value *= alphabet.length;
	            value += alphabet.length - 1 - alphabet.indexOf(key.charAt(k));
	        }
	        value = -value;
	    }
	    return value;
	}

	function repeat(text, count) {
	    var result = "";
	    if (typeof text.repeat === "function") {
	        result = text.repeat(count);
	    }
	    else {
	        if (count > 0) {
	            while (count > 1) {
	                if (count & 1) {
	                    result += text;
	                }
	                count >>= 1;
	                text += text;
	            }
	            result = result + text;
	        }
	    }
	    return result;
	}

	function decrement(key) {
	    return key.replace(/[^-]-*$/, function (match) {
	        var index = alphabet.indexOf(match.charAt(0));
	        if (index === -1) {
	            throw new Error("Unexpected character '" + match.charAt(0) + "'.");
	        }
	        return alphabet.charAt(index - 1) + repeat("z", match.length - 1);
	    });
	}

	function encode(component) {
	    return component.replace(/[\/\.\$\[\]#!]/g, function (match) { return "!" + match.charCodeAt(0).toString(16).toUpperCase(); });
	}

	function encodeLexicographic(value) {
	    var result = "";
	    if (value === 0) {
	        result = "a-";
	    }
	    else if (value > 0) {
	        while (value > 0) {
	            var digit = (value % alphabet.length);
	            result = alphabet.charAt(digit) + result;
	            value -= digit;
	            value /= alphabet.length;
	        }
	        var prefix = alphabet.charAt(result.length + 37);
	        result = prefix + result;
	    }
	    else {
	        value = -value;
	        while (value > 0) {
	            var digit = (value % alphabet.length);
	            result = alphabet.charAt(alphabet.length - 1 - digit) + result;
	            value -= digit;
	            value /= alphabet.length;
	        }
	        var prefix = alphabet.charAt(37 - result.length);
	        result = prefix + result;
	    }
	    return result;
	}

	function increment(key) {
	    return key.replace(/[^z]z*$/, function (match) {
	        var index = alphabet.indexOf(match.charAt(0));
	        if (index === -1) {
	            throw new Error("Unexpected character '" + match.charAt(0) + "'.");
	        }
	        return alphabet.charAt(index + 1) + repeat("-", match.length - 1);
	    });
	}

	function randomString(alphabet, length) {
	    var buffer = [];
	    length = length | 0;
	    while (length) {
	        var r = (Math.random() * alphabet.length) | 0;
	        buffer.push(alphabet.charAt(r));
	        length -= 1;
	    }
	    return buffer.join("");
	}

	var lastTimestamp = 0;
	function key(timestamp, as) {
	    if (timestamp === undefined) {
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
	function resetLastTimestamp() {
	    lastTimestamp = 0;
	}



	var esm5 = /*#__PURE__*/Object.freeze({
		date: date,
		decode: decode,
		decodeLexicographic: decodeLexicographic,
		decrement: decrement,
		encode: encode,
		encodeLexicographic: encodeLexicographic,
		increment: increment,
		key: key,
		resetLastTimestamp: resetLastTimestamp,
		milliseconds: milliseconds
	});

	var lib = createCommonjsModule(function (module, exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	}); // Default Export



	exports.default = model.default; // Named Exports



	exports.property = property.property;
	exports.pushKey = property.pushKey;
	exports.constrainedProperty = property.constrainedProperty;
	exports.constrain = property.constrain;
	exports.min = property.min;
	exports.max = property.max;
	exports.length = property.length;
	exports.desc = property.desc;



	exports.hasMany = relationship.hasMany;
	exports.ownedBy = relationship.ownedBy;
	exports.inverse = relationship.inverse;



	exports.schema = schema_1.schema;

	var model_2 = model;

	exports.Model = model_2.default;



	exports.BaseSchema = baseSchema.BaseSchema;
	exports.RelationshipPolicy = baseSchema.RelationshipPolicy;
	exports.RelationshipCardinality = baseSchema.RelationshipCardinality;



	exports.Record = record.Record;



	exports.List = list.List;



	exports.fbKey = esm5.key;
	});

	var index = unwrapExports(lib);
	var lib_1 = lib.property;
	var lib_2 = lib.pushKey;
	var lib_3 = lib.constrainedProperty;
	var lib_4 = lib.constrain;
	var lib_5 = lib.min;
	var lib_6 = lib.max;
	var lib_7 = lib.length;
	var lib_8 = lib.desc;
	var lib_9 = lib.hasMany;
	var lib_10 = lib.ownedBy;
	var lib_11 = lib.inverse;
	var lib_12 = lib.schema;
	var lib_13 = lib.Model;
	var lib_14 = lib.BaseSchema;
	var lib_15 = lib.RelationshipPolicy;
	var lib_16 = lib.RelationshipCardinality;
	var lib_17 = lib.Record;
	var lib_18 = lib.List;
	var lib_19 = lib.fbKey;

	exports.default = index;
	exports.property = lib_1;
	exports.pushKey = lib_2;
	exports.constrainedProperty = lib_3;
	exports.constrain = lib_4;
	exports.min = lib_5;
	exports.max = lib_6;
	exports.length = lib_7;
	exports.desc = lib_8;
	exports.hasMany = lib_9;
	exports.ownedBy = lib_10;
	exports.inverse = lib_11;
	exports.schema = lib_12;
	exports.Model = lib_13;
	exports.BaseSchema = lib_14;
	exports.RelationshipPolicy = lib_15;
	exports.RelationshipCardinality = lib_16;
	exports.Record = lib_17;
	exports.List = lib_18;
	exports.fbKey = lib_19;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
