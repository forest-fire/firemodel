import { FireModelError } from "../FireModelError";
import { Record } from "../../Record";
import { Model } from "../../Model";
import { IFmRelationshipOperation } from "../../@types";
export declare class UnknownRelationshipProblem<T extends Model> extends FireModelError {
    constructor(err: Error, rec: Record<T>, property: keyof T, operation?: IFmRelationshipOperation | "n/a", whileDoing?: string);
}
