import { Model } from "../models/Model";
import { Record } from "../Record";

export function isHasManyRelationship<T extends Model>(
  rec: Record<T>,
  property: keyof T & string
) {
  return rec.META.relationship(property).relType === "hasMany" ? true : false;
}
