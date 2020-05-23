"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const universal_fire_1 = require("universal-fire");
const private_1 = require("@/private");
class WatchRecord extends private_1.WatchBase {
    static record(modelConstructor, pk, options = {}) {
        if (!pk) {
            throw new private_1.FireModelError(`Attempt made to watch a RECORD but no primary key was provided!`, "firemodel/no-pk");
        }
        const o = new WatchRecord();
        // if options hash has a DB reference; use it
        if (o.db) {
            o._db = options.db;
        }
        o._eventType = "value";
        o._watcherSource = "record";
        const r = private_1.Record.createWith(modelConstructor, pk, options.db ? { db: options.db } : {});
        o._query = universal_fire_1.SerializedQuery.create(options.db || private_1.FireModel.defaultDb, `${r.dbPath}`);
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