import { IModel, IRecord } from "../../@types/index";
import { FireModelError } from "..";
export declare class MissingReciprocalInverse<T extends IModel> extends FireModelError {
    constructor(rec: IRecord<T>, property: keyof T & string);
}
