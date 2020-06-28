import { FireModelError } from "..";
import { IFmRelationshipOperation } from "../../@types/index";
import { IModel } from "../../@types/index";
import { Record } from "../../core";
export declare class UnknownRelationshipProblem<T extends IModel> extends FireModelError {
    constructor(err: Error, rec: Record<T>, property: keyof T, operation?: IFmRelationshipOperation | "n/a", whileDoing?: string);
}
