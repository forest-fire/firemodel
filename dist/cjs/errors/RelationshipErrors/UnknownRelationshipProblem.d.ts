import { Model, Record } from "../../core";
import { FireModelError } from "../index";
import { IFmRelationshipOperation } from "../../@types/index";
export declare class UnknownRelationshipProblem<T extends Model> extends FireModelError {
    constructor(err: Error, rec: Record<T>, property: keyof T, operation?: IFmRelationshipOperation | "n/a", whileDoing?: string);
}
