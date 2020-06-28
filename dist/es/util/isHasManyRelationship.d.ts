import type { IModel, IRecord } from "../types";
export declare function isHasManyRelationship<T extends IModel>(rec: IRecord<T>, property: keyof T & string): boolean;
