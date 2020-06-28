import { FireModelError } from "..";
import { IFmRelationshipOperation } from "../../types";
import { IModel } from "../../types";
import { Record } from "../../core";
export declare class UnknownRelationshipProblem<T extends IModel> extends FireModelError {
    constructor(err: Error, rec: Record<T>, property: keyof T, operation?: IFmRelationshipOperation | "n/a", whileDoing?: string);
}
