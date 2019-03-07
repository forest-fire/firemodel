import { IDictionary, fk, pk } from "common-types";

export type IIdWithDynamicPrefix = IDictionary<number | string> & {
  id: string;
};

export type ICompositeKey = IDictionary<string | number> & { id: string };
export type IFkReference = fk | ICompositeKey;
export type IPrimaryKey = pk | ICompositeKey;
