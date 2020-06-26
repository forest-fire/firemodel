import { FireModelError } from "../index";
import { Model, Record } from "../../core";
export declare class IncorrectReciprocalInverse<T extends Model> extends FireModelError {
    constructor(rec: Record<T>, property: keyof T & string);
}
