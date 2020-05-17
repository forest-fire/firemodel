import { WatchBase } from "./WatchBase";
import { FireModelError } from "../errors";
import { Record } from "..";
import { SerializedQuery } from "@forest-fire/base-serializer";
export class WatchRecord extends WatchBase {
    static record(modelConstructor, pk, options = {}) {
        if (!pk) {
            throw new FireModelError(`Attempt made to watch a RECORD but no primary key was provided!`, "firemodel/no-pk");
        }
        const o = new WatchRecord();
        // if options hash has a DB reference; use it
        if (o.db) {
            o._db = options.db;
        }
        o._eventType = "value";
        o._watcherSource = "record";
        const r = Record.createWith(modelConstructor, pk, options.db ? { db: options.db } : {});
        o._query = SerializedQuery.create(o._db, `${r.dbPath}`);
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
//# sourceMappingURL=WatchRecord.js.map