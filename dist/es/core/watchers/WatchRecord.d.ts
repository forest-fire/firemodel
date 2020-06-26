import { Model, WatchBase } from "..";
import { IModelOptions, IPrimaryKey } from "../../@types/index";
export declare class WatchRecord<T extends Model> extends WatchBase<T> {
    static record<T extends Model>(modelConstructor: new () => T, pk: IPrimaryKey<T>, options?: IModelOptions): WatchRecord<T>;
}
