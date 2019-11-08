import { Model } from "./Model";
import { Record } from "./Record";
import { RealTimeDB } from "abstracted-firebase";
import { SerializedQuery } from "serialized-query";
import { IModelOptions } from "./@types";
export declare class AuditBase<T extends Model = Model> {
    protected _modelKlass: new () => T;
    protected _record: Record<T>;
    protected _db: RealTimeDB;
    protected _query: SerializedQuery;
    protected _recordId: string;
    protected _property: string;
    protected get db(): RealTimeDB;
    protected get dbPath(): any;
    constructor(modelKlass: new () => T, options?: IModelOptions);
}
