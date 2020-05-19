import { AbstractedDatabase } from "@forest-fire/abstracted-database";
import { BaseSerializer } from "@forest-fire/serialized-query";
import { Model } from "./models/Model";
import { Record } from "./Record";
import { IModelOptions } from "./@types";
export declare class AuditBase<T extends Model = Model> {
    protected _modelKlass: new () => T;
    protected _record: Record<T>;
    protected _db: AbstractedDatabase;
    protected _query: BaseSerializer;
    protected _recordId: string;
    protected _property: string;
    protected get db(): AbstractedDatabase;
    protected get dbPath(): any;
    constructor(modelKlass: new () => T, options?: IModelOptions);
}
