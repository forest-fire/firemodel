import { FireModelError, Model, Record } from "../../private";
import { IFmRelationshipOperation } from "../../@types/index";
export declare class UnknownRelationshipProblem<T extends Model> extends FireModelError {
    constructor(err: Error, rec: Record<T>, property: keyof T, operation?: IFmRelationshipOperation | "n/a", whileDoing?: string);
}
