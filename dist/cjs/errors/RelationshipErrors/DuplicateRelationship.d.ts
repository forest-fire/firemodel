import { FireModelError } from "../index";
import { Model } from "../../core";
export declare class DuplicateRelationship<P extends Model, F extends Model> extends FireModelError {
    constructor(pk: P, property: string, fkId: string);
}
