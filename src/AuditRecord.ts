import { IAuditLogItem } from "./Audit";
import { epochWithMilliseconds } from "common-types";
import { Model } from "./Model";
import { AuditBase } from "./AuditBase";
import { SerializedQuery } from "serialized-query";
import { pathJoin } from "./path";
import { Parallel } from "wait-in-parallel";
import { IModelOptions } from "./@types";

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

    this._query = this._query.orderByKey().limitToLast(howMany);
    if (startAt) {
      this._query = this._query.startAt(startAt);
    }
    const ids = (await this.db.getList(this._query)).map(i =>
      pathJoin(this.auditLogs, i.id)
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
      pathJoin(this.auditLogs, i.id)
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

    const ids = (await this.db.getList(this._query)).map(i =>
      pathJoin(this.auditLogs, i.id)
    );

    const p = new Parallel<IAuditLogItem>();

    ids.map(id => {
      p.add(id, this.db.getValue(id));
    });
    const results = await p.isDoneAsArray();
    return results;
  }

  public async before(when: epochWithMilliseconds | string) {
    if (typeof when === "string") {
      when = new Date(when).getTime();
    }

    this._query = this._query
      .setPath(this.byId)
      .orderByChild("value")
      .endAt(when);
    const qr = await this.db.getList(this._query);

    const ids = (await this.db.getList(this._query)).map(i =>
      pathJoin(this.auditLogs, i.id)
    );

    const p = new Parallel<IAuditLogItem>();

    ids.map(id => {
      p.add(id, this.db.getValue(id));
    });
    const results = await p.isDoneAsArray();
    return results;
  }

  public async between(
    after: epochWithMilliseconds | string,
    before: epochWithMilliseconds | string
  ) {
    if (typeof after === "string") {
      after = new Date(after).getTime();
    }
    if (typeof before === "string") {
      before = new Date(before).getTime();
    }

    this._query = this._query
      .setPath(this.byId)
      .orderByChild("value")
      .startAt(after)
      .endAt(before);
    const qr = await this.db.getList(this._query);

    const ids = (await this.db.getList(this._query)).map(i =>
      pathJoin(this.auditLogs, i.id)
    );

    const p = new Parallel<IAuditLogItem>();

    ids.map(id => {
      p.add(id, this.db.getValue(id));
    });
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
