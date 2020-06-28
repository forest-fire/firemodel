import type { IModel, IRecord } from "@/types";

export function isHasManyRelationship<T extends IModel>(
  rec: IRecord<T>,
  property: keyof T & string
) {
  return rec.META.relationship(property)?.relType === "hasMany" ? true : false;
}
