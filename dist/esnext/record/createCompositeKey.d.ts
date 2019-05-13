import { Model, Record, ICompositeKey } from "..";
export declare function createCompositeKey<T extends Model = Model>(rec: Record<T>): ICompositeKey;
