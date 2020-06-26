import { FireModelError } from "@errors";
import { Model } from "@/models";
import { Record } from "@/core";

export class NotHasManyRelationship<T extends Model> extends FireModelError {
  constructor(rec: Record<T>, property: string, method: string) {
    super("", "firemodel/not-hasMany-reln");
    this.message = `attempt to call ${rec.modelName}::${method}() with property "${property}" failed because ${property} does not have a hasMany relationship`;
  }
}
