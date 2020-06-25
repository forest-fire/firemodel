import { FireModelError, Model, Record } from "../../private";
export declare class MissingReciprocalInverse<T extends Model> extends FireModelError {
    constructor(rec: Record<T>, property: keyof T & string);
}
