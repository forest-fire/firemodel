import { FireModelError, Model } from "../../private";
export declare class FkDoesNotExist<P extends Model, F extends Model> extends FireModelError {
    constructor(pk: P, property: string, fkId: string);
}
