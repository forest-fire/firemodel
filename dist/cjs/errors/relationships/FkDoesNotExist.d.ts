import { FireModelError } from "../FireModelError";
import { Model } from "../../models/Model";
export declare class FkDoesNotExist<P extends Model, F extends Model> extends FireModelError {
    constructor(pk: P, property: string, fkId: string);
}
