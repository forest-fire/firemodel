import { FireModelError } from "..";
import { IModel } from "../../@types/index";
export declare class DuplicateRelationship<P extends IModel, F extends IModel> extends FireModelError {
    constructor(pk: P, property: string, fkId: string);
}
