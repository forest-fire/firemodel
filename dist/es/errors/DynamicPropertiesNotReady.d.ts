import { IModel, IRecord } from "../@types/index";
import { FireModelError } from "./";
export declare class DynamicPropertiesNotReady<T extends IModel> extends FireModelError {
    constructor(rec: IRecord<T>, message?: string);
}
