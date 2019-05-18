import { IFmRelationshipOperation } from "../@types";
import { Model, Record } from "..";
/**
 * sets the `Record` property to the optimistic values set
 * with the relationship CRUD event.
 */
export declare function locallyUpdateFkOnRecord<T extends Model>(rec: Record<T>, op: IFmRelationshipOperation, prop: keyof T, id: string): void;
