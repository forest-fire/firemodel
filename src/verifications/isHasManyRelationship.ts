import { Model, Record } from "@/private";

export function isHasManyRelationship<T extends Model>(
  rec: Record<T>,
  property: keyof T & string
) {
  return rec.META.relationship(property).relType === "hasMany" ? true : false;
}
