import { IAuditLogItem } from "./Audit";
import { epochWithMilliseconds } from "common-types";
import { Model, IModelOptions } from "./Model";
import { AuditBase } from "./AuditBase";
import { SerializedQuery } from "serialized-query";
import { pathJoin } from "./path";
import { Parallel } from "wait-in-parallel";

export class AuditRecord<T extends Model> extends AuditBase {
  constructor(
    modelKlass: new () => T,
    id: string,
    options: IModelOptions = {}
  ) {
    super(modelKlass, options);
    this._recordId = id;
    this._query = new SerializedQuery();
  }

  public async first(howMany: number, startAt?: string) {
    this._query = this._query.setPath(this.byId);
    console.log(this.byId);

    this._query = this._query.orderByKey().limitToLast(howMany);
    if (startAt) {
      this._query = this._query.startAt(startAt);
    }
    const ids = (await this.db.getList(this._query)).map(i =>
      pathJoin(this.auditLogs, i)
    );
    const p = new Parallel<IAuditLogItem>();
    ids.map(id => p.add(id, this.db.getValue(id)));
    const results = await p.isDoneAsArray();
    return results;
  }

  public async last(howMany: number, startAt?: string) {
    this._query = this._query
      .setPath(this.byId)
      .orderByKey()
      .limitToFirst(howMany);
    if (startAt) {
      this._query = this._query.startAt(startAt);
    }
    const ids = (await this.db.getList(this._query)).map(i =>
      pathJoin(this.auditLogs, i)
    );
    const p = new Parallel<IAuditLogItem>();
    ids.map(id => p.add(id, this.db.getValue(id)));
    const results = await p.isDoneAsArray();
    return results;
  }

  public async since(when: epochWithMilliseconds | string) {
    if (typeof when === "string") {
      when = new Date(when).getTime();
    }

    this._query = this._query
      .setPath(this.byId)
      .orderByChild("value")
      .startAt(when);
    const qr = await this.db.getList(this._query);
    console.log(qr);

    const ids = (await this.db.getList(this._query)).map(i =>
      pathJoin(this.auditLogs, i)
    );
    console.log(when, this.db.mock.db.auditing.people.byId);

    const p = new Parallel<IAuditLogItem>();
    ids.map(id => p.add(id, this.db.getValue(id)));
    const results = await p.isDoneAsArray();
    return results;
  }

  protected get auditLogs() {
    return pathJoin(this.dbPath, "all");
  }

  protected get byId() {
    return pathJoin(this.dbPath, "byId", this._recordId, "all");
  }

  protected byProp(prop: string) {
    return pathJoin(this.dbPath, "byId", this._recordId, "props", prop);
  }
}
