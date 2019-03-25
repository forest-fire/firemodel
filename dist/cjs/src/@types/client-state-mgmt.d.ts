import { Model } from "../Model";
export interface ILocalStateManagement<T extends Model = Model> {
    model: new () => T;
    localPath: string;
}
