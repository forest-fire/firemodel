import { IModel, IRecord } from "../../types";
import { FireModelError } from "..";
/**
 * When the record's META points to a inverse property on the FK; this error
 * presents when that `FK[inverseProperty]` doesn't exist in the FK's meta.
 */
export declare class MissingInverseProperty<T extends IModel> extends FireModelError {
    from: string;
    to: string;
    inverseProperty: string;
    constructor(rec: IRecord<T>, property: keyof T & string);
}
