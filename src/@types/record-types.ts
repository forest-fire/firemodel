import { IDictionary } from "common-types";

export type IIdWithDynamicPrefix = IDictionary<number | string> & {
  id: string;
};
