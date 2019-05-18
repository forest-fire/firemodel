import { Model } from "../Model";
import { Record } from "../Record";

export function isHasManyRelationship<T extends Model>(
  rec: Record<T>,
  property: keyof T
) {
  return rec.META.relationship(property).relType === "hasMany" ? true : false;
}
