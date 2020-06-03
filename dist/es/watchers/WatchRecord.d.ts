import { Model } from "../models/Model";
import { WatchBase } from "./WatchBase";
import { IPrimaryKey, IModelOptions } from "../@types";
export declare class WatchRecord<T extends Model> extends WatchBase<T> {
    static record<T extends Model>(modelConstructor: new () => T, pk: IPrimaryKey<T>, options?: IModelOptions): WatchRecord<T>;
}
