import { epochWithMilliseconds } from "common-types";
import { Model } from "./models/Model";
import { AuditBase } from "./AuditBase";
import { pathJoin } from "./path";
import { SerializedRealTimeQuery } from "@forest-fire/serialized-query";
import { IModelOptions, IAuditLogItem } from "./@types";

export class AuditList<T extends Model> extends AuditBase<T> {
  constructor(modelKlass: new () => T, options: IModelOptions = {}) {
    super(modelKlass, options);
    this._query = new SerializedRealTimeQuery(pathJoin(this.dbPath, "all"));
  }

  public async first(
    howMany: number,
    offset: number = 0
  ): Promise<IAuditLogItem[]> {
    this._query = this._query.limitToFirst(howMany).startAt(offset);
    const log = await this.db.getList<IAuditLogItem>(this._query);
    return log || [];
  }

  public async last(
    howMany: number,
    offset: number = 0
  ): Promise<IAuditLogItem[]> {
    this._query = this._query.limitToLast(howMany).startAt(offset);
    const log = await this.db.getList<IAuditLogItem>(this._query);
    return log || [];
  }

  public async since(
    when: epochWithMilliseconds | string
  ): Promise<IAuditLogItem[]> {
    this._query = this._query.orderByChild("createdAt").startAt(when);
    const log = await this.db.getList<IAuditLogItem>(this._query);
    return log || [];
  }

  public async before(
    when: epochWithMilliseconds | string
  ): Promise<IAuditLogItem[]> {
    this._query = this._query.orderByChild("createdAt").endAt(when);
    const log = await this.db.getList<IAuditLogItem>(this._query);
    return log || [];
  }

  public async between(
    from: epochWithMilliseconds | string,
    to: epochWithMilliseconds | string
  ): Promise<IAuditLogItem[]> {
    this._query = this._query
      .orderByChild("createdAt")
      .startAt(from)
      .endAt(to);
    const log = await this.db.getList<IAuditLogItem>(this._query);
    return log || [];
  }
}
