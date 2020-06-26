import { FireModel, Record } from "@/core";
import { IAbstractedDatabase, ISerializedQuery } from "universal-fire";

import { IModelOptions } from "@types";
import { Model } from "@/models";
import { pathJoin } from "@/util";

export class AuditBase<T extends Model = Model> {
  protected _modelKlass: new () => T;
  protected _record: Record<T>;
  protected _db: IAbstractedDatabase;
  protected _query: ISerializedQuery;
  // index searchs (future)
  protected _recordId: string;
  protected _property: string;

  protected get db(): IAbstractedDatabase {
    return this._db;
  }

  protected get dbPath() {
    return pathJoin(FireModel.auditLogs, this._record.pluralName);
  }

  constructor(modelKlass: new () => T, options: IModelOptions = {}) {
    this._modelKlass = modelKlass;
    this._record = Record.create(modelKlass);
    this._db = options.db || FireModel.defaultDb;
  }
}
