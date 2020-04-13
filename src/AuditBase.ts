import { AbstractedDatabase } from "abstracted-database";
import { SerializedQuery } from "serialized-query";

import { Model } from "./models/Model";
import { FireModel } from "./FireModel";
import { Record } from "./Record";
import { pathJoin } from "./path";
import { IModelOptions } from "./@types";

export class AuditBase<T extends Model = Model> {
  protected _modelKlass: new () => T;
  protected _record: Record<T>;
  protected _db: AbstractedDatabase;
  protected _query: SerializedQuery;
  // index searchs (future)
  protected _recordId: string;
  protected _property: string;

  protected get db(): AbstractedDatabase {
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
