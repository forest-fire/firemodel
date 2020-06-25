import {
  FireModel,
  FireModelError,
  IModelOptions,
  IPrimaryKey,
  Model,
  Record,
  WatchBase,
} from "@/private";

import { SerializedQuery } from "universal-fire";

export class WatchRecord<T extends Model> extends WatchBase<T> {
  public static record<T extends Model>(
    modelConstructor: new () => T,
    pk: IPrimaryKey<T>,
    options: IModelOptions = {}
  ) {
    if (!pk) {
      throw new FireModelError(
        `Attempt made to watch a RECORD but no primary key was provided!`,
        "firemodel/no-pk"
      );
    }
    const o = new WatchRecord<T>();
    // if options hash has a DB reference; use it
    if (o.db) {
      o._db = options.db;
    }

    o._eventType = "value";
    o._watcherSource = "record";

    const r = Record.createWith<T>(
      modelConstructor,
      pk,
      options.db ? { db: options.db } : {}
    );
    o._query = SerializedQuery.create<T>(
      options.db || FireModel.defaultDb,
      `${r.dbPath}`
    );
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
