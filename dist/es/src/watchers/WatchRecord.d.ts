import { IPrimaryKey, IModelOptions, Model, WatchBase } from "../private";
export declare class WatchRecord<T extends Model> extends WatchBase<T> {
    static record<T extends Model>(modelConstructor: new () => T, pk: IPrimaryKey<T>, options?: IModelOptions): WatchRecord<T>;
}
