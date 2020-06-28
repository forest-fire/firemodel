import { IAuditChange, IAuditOperations } from "@/types";
import { index, model, property } from "@/decorators";

import { Model } from "@/models";

@model({ dbOffset: "_auditing" })
export class AuditLog extends Model {
  /** the `Model` which has been changed */
  @property @index modelName: string;
  /** the `id` of the record changing */
  @property @index modelId: string;
  /** the record-level operation */
  @property changes: IAuditChange[];
  /** the changes to properties, typically not represented in a "removed" op */
  @property action: IAuditOperations;
}
