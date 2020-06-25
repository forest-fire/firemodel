import { Model, Record } from "../private";
export declare function isHasManyRelationship<T extends Model>(rec: Record<T>, property: keyof T & string): boolean;
