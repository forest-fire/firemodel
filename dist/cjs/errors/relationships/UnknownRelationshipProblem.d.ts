import { FireModelError, IFmRelationshipOperation, Model, Record } from "../../private";
export declare class UnknownRelationshipProblem<T extends Model> extends FireModelError {
    constructor(err: Error, rec: Record<T>, property: keyof T, operation?: IFmRelationshipOperation | "n/a", whileDoing?: string);
}
