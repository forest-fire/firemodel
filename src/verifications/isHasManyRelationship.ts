import { Model, Record } from "@/core";

export function isHasManyRelationship<T extends Model>(
  rec: Record<T>,
  property: keyof T & string
) {
  return rec.META.relationship(property).relType === "hasMany" ? true : false;
}
