import { Model, Record } from "../core";
export declare function isHasManyRelationship<T extends Model>(rec: Record<T>, property: keyof T & string): boolean;
