import { IDictionary } from "common-types";

export type ICardinalityConfig<T> = {
  [key in keyof T]: [number, number] | number | true
};
export interface IMockConfig<T> {
  relationshipBehavior: "ignore" | "link" | "follow";
  cardinality?: IDictionary<number | [number, number] | true>;
}
