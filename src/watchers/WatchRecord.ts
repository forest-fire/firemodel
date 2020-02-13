import { Model } from "../models/Model";
import { WatchBase } from "./WatchBase";
import { IPrimaryKey, IModelOptions } from "../@types";
import { FireModelError } from "../errors";
import { Record } from "..";
import { SerializedQuery } from "serialized-query";

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
    o._query = new SerializedQuery<T>(`${r.dbPath}`);
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
