import { Record } from "../Record";
import { ISchemaMetaProperties } from "../decorators/schema";
export declare class ArrayOfRecords<T> extends Array<T> {
    __record__: Record<T>;
    readonly modelName: string;
    readonly pluralName: any;
    readonly pushKeys: {};
    readonly properties: {};
    readonly relationships: {};
    readonly dbOffset: string;
    readonly isAudited: boolean;
    property(prop: keyof T): ISchemaMetaProperties | null;
}
