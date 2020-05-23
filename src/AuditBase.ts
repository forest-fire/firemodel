import { IAbstractedDatabase } from "universal-fire";
import type { BaseSerializer } from "@forest-fire/serialized-query";

import { IModelOptions, Model, FireModel, Record, pathJoin } from "@/private";

export class AuditBase<T extends Model = Model> {
  protected _modelKlass: new () => T;
  protected _record: Record<T>;
  protected _db: IAbstractedDatabase;
  protected _query: BaseSerializer;
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
