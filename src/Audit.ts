import { Model, IModelOptions } from "./Model";
import { epochWithMilliseconds } from "common-types";
import { FireModel } from "./FireModel";
import { pathJoin } from "./path";
import { AuditList } from "./AuditList";
import { Parallel } from "wait-in-parallel";
import { fbKey } from "./index";
import { AuditRecord } from "./AuditRecord";

export interface IAuditLogItem {
  createdAt: epochWithMilliseconds;
  recordId: string;
  timestamp: epochWithMilliseconds;
  /** the record-level operation */
  action: IAuditOperations;
  /** the changes to properties, typically not represented in a "removed" op */
  changes: IAuditChange[];
}

export interface IAuditChange {
  /** the property name which changed */
  property: string;
  /** the property level operation */
  action: IAuditOperations;
  before: any;
  after: any;
}

export type IAuditOperations = "added" | "updated" | "removed";

export interface IAuditRecordReference {
  id: string;
  createdAt: number;
  action: IAuditOperations;
}

export async function writeAudit(
  recordId: string,
  pluralName: string,
  action: IAuditOperations,
  changes: IAuditChange[],
  options: IModelOptions = {}
) {
  const db = options.db || FireModel.defaultDb;
  const timestamp = new Date().getTime();
  const writePath = pathJoin(FireModel.auditLogs, pluralName);
  const p = new Parallel();
  const createdAt = new Date().getTime();
  const auditId = fbKey();
  p.add(
    "audit-log-item",
    db.set<IAuditLogItem>(pathJoin(writePath, "all", auditId), {
      createdAt,
      recordId,
      timestamp,
      action,
      changes
    })
  );

  const mps = db.multiPathSet(pathJoin(writePath, "byId", recordId));
  mps.add({ path: pathJoin("all", auditId), value: createdAt });

  changes.map(change => {
    mps.add({
      path: pathJoin("props", change.property, auditId),
      value: createdAt
    });
  });
  p.add("byId", mps.execute());

  await p.isDone();
}

export class Audit<T extends Model = Model> {
  public static list<T>(modelKlass: new () => T, options: IModelOptions = {}) {
    return new AuditList<T>(modelKlass, options);
  }
  public static record<T>(
    modelKlass: new () => T,
    id: string,
    options: IModelOptions = {}
  ) {
    return new AuditRecord<T>(modelKlass, id, options);
  }
}
