import type { Record } from "@/core";
import type { Model } from "@/models";

export function isHasManyRelationship<T extends Model>(
  rec: Record<T>,
  property: keyof T & string
) {
  return rec.META.relationship(property).relType === "hasMany" ? true : false;
}
