import { Model } from "../Model";
import { Record } from "../Record";
export declare function isHasManyRelationship<T extends Model>(rec: Record<T>, property: keyof T & string): boolean;
