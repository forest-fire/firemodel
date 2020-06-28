import { FireModelError } from "..";
import { IModel } from "../../types";
export declare class FkDoesNotExist<P extends IModel, F extends IModel> extends FireModelError {
    constructor(pk: P, property: string, fkId: string);
}
