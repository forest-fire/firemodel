import { Record } from "../core";
import { IAbstractedDatabase, ISerializedQuery } from "universal-fire";
import { IModel, IModelOptions } from "../types";
export declare class AuditBase<T extends IModel = IModel> {
    protected _modelKlass: new () => T;
    protected _record: Record<T>;
    protected _db: IAbstractedDatabase;
    protected _query: ISerializedQuery;
    protected _recordId: string;
    protected _property: string;
    protected get db(): IAbstractedDatabase;
    protected get dbPath(): any;
    constructor(modelKlass: new () => T, options?: IModelOptions);
}
