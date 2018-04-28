import "reflect-metadata";
import { IDictionary, ClassDecorator } from "common-types";
export interface ISchemaOptions {
    dbOffset?: string;
    localOffset?: string;
    property?: (prop: string) => IDictionary;
    audit?: boolean;
    properties?: ISchemaMetaProperties[];
    relationships?: ISchemaMetaProperties[];
    pushKeys?: string[];
}
export interface ISchemaMetaProperties {
    type: string;
    length?: number;
    min?: number;
    max?: number;
    inverse?: string;
    isRelationship?: boolean;
    isProperty?: boolean;
    pushKey?: boolean;
    [key: string]: any;
}
export declare function schema(options: ISchemaOptions): ClassDecorator;
