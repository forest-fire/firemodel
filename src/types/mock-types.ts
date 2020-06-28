import { ICompositeKey } from "@/types";
import { IDictionary } from "common-types";

export type ICardinalityConfig<T> = {
  [key in keyof T]: [number, number] | number | true;
};

export type RelationshipBehavior /** fk's are not poplated */ =
  | "ignore"
  /** fk's are created but the records they point to are not created */
  | "link"
  /** fk's are created and the records they point to are created */
  | "follow";

export type DynamicPathBehavior = "signature" | "signature-exact" | "reflexive";
export interface IMockRelationshipConfig {
  relationshipBehavior: RelationshipBehavior;
  dynamicPathBehavior?: DynamicPathBehavior;
  /** allow the exceptions stated in the Mock to be pass through to all FK's */
  exceptionPassthrough?: boolean;
  cardinality?: IDictionary<number | [number, number] | true>;
}

export interface IMockResponse<T> {
  modelName: string;
  pluralName: string;
  id: string;
  compositeKey: ICompositeKey<T>;
  dbPath: string;
  localPath: string;
}
