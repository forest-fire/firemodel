import { Model, IModelOptions } from "./Model";
import { epochWithMilliseconds, IDictionary } from "common-types";
import { FireModel } from "./FireModel";
import { Record } from "./Record";
import { pathJoin } from "./path";
// tslint:disable-next-line:no-implicit-dependencies
import { RealTimeDB } from "abstracted-firebase";
import { SerializedQuery } from "serialized-query";
import { AuditList } from "./AuditList";

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
  await db.push<IAuditLogItem>(writePath, {
    createdAt: new Date().getTime(),
    recordId,
    timestamp,
    action,
    changes
  });
}

export class Audit<T extends Model = Model> {
  public static list<T>(modelKlass: new () => T, options: IModelOptions = {}) {
    return new AuditList<T>(modelKlass, options);
  }
}
