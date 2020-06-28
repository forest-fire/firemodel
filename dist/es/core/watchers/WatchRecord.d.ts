import { IModel, IModelOptions, IPrimaryKey } from "../../@types/index";
import { WatchBase } from "./WatchBase";
export declare class WatchRecord<T extends IModel> extends WatchBase<T> {
    static record<T extends IModel>(modelConstructor: new () => T, pk: IPrimaryKey<T>, options?: IModelOptions): WatchRecord<T>;
}
