import { Model, IModelOptions } from "./Model";
import { Record } from "./Record";
import { RealTimeDB } from "abstracted-firebase";
import { SerializedQuery } from "serialized-query";
export declare class AuditBase<T extends Model = Model> {
    protected _modelKlass: new () => T;
    protected _record: Record<T>;
    protected _db: RealTimeDB;
    protected _query: SerializedQuery;
    protected _recordId: string;
    protected _property: string;
    protected readonly db: RealTimeDB;
    protected readonly dbPath: any;
    constructor(modelKlass: new () => T, options?: IModelOptions);
}
