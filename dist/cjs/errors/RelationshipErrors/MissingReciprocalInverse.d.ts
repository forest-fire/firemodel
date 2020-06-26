import { Model, Record } from "../../core";
import { FireModelError } from "../index";
export declare class MissingReciprocalInverse<T extends Model> extends FireModelError {
    constructor(rec: Record<T>, property: keyof T & string);
}
