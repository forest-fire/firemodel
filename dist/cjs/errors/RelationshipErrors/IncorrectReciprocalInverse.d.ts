import { FireModelError, Model, Record } from "../../private";
export declare class IncorrectReciprocalInverse<T extends Model> extends FireModelError {
    constructor(rec: Record<T>, property: keyof T & string);
}
