import { Record } from "./Record";
import { IModelPropertyMeta } from "./decorators/schema";
import { Model } from "./Model";
export declare class ListProxy<T> extends Array<T> {
    static create<T extends Model>(modelConstructor: new () => T, items?: T[]): ListProxy<T>;
    __record__: Record<T>;
    private constructor();
    readonly modelName: string;
    readonly pluralName: any;
    readonly pushKeys: {};
    readonly properties: IModelPropertyMeta<T>[];
    readonly relationships: import("./decorators/schema").IModelRelationshipMeta<T>[];
    readonly dbOffset: string;
    readonly isAudited: boolean;
    property(prop: keyof T): IModelPropertyMeta | null;
}
