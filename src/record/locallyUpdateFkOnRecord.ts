import { IFmRelationshipOperation } from "../@types";
import { Model, Record } from "..";

/**
 * sets the `Record` property to the optimistic values set
 * with the relationship CRUD event.
 */
export function locallyUpdateFkOnRecord<T extends Model>(
  rec: Record<T>,
  op: IFmRelationshipOperation,
  prop: keyof T,
  id: string
) {
  const relnType = rec.META.relationship(prop).relType;

  switch (op) {
    case "set":
    case "add":
      (rec as any)._data[prop] =
        relnType === "hasMany" ? { ...rec.data[prop], ...{ [id]: true } } : id;
      return;
    case "remove":
      if (relnType === "hasMany") {
        delete (rec as any)._data[prop][id];
      } else {
        (rec as any)._data[prop] = "";
      }
      return;
  }
}
