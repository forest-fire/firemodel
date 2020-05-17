"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WatchBase_1 = require("./WatchBase");
const errors_1 = require("../errors");
const __1 = require("..");
const base_serializer_1 = require("@forest-fire/base-serializer");
const FireModel_1 = require("../FireModel");
class WatchRecord extends WatchBase_1.WatchBase {
    static record(modelConstructor, pk, options = {}) {
        if (!pk) {
            throw new errors_1.FireModelError(`Attempt made to watch a RECORD but no primary key was provided!`, "firemodel/no-pk");
        }
        const o = new WatchRecord();
        // if options hash has a DB reference; use it
        if (o.db) {
            o._db = options.db;
        }
        o._eventType = "value";
        o._watcherSource = "record";
        const r = __1.Record.createWith(modelConstructor, pk, options.db ? { db: options.db } : {});
        o._query = base_serializer_1.SerializedQuery.create(options.db || FireModel_1.FireModel.defaultDb, `${r.dbPath}`);
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
exports.WatchRecord = WatchRecord;
//# sourceMappingURL=WatchRecord.js.map