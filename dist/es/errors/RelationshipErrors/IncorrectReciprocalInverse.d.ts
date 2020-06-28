import { FireModelError } from "..";
import { IModel, IRecord } from "../../types";
export declare class IncorrectReciprocalInverse<T extends IModel> extends FireModelError {
    constructor(rec: IRecord<T>, property: keyof T & string);
}
