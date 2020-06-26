import { Model, Record } from "@/private";

import { FireModelError } from "@errors";

export class NotHasOneRelationship<T extends Model> extends FireModelError {
  constructor(rec: Record<T>, property: string, method: string) {
    super("", "firemodel/not-hasOne-reln");
    this.message = `attempt to call ${rec.modelName}::${method}() with property "${property}" failed because ${property} does not have a hasOne relationship`;
  }
}
