import { Model, Record } from "../core";
import { FireModelError } from "./index";
import { IFmCrudOperation } from "../@types/index";
export declare class RecordCrudFailure<T extends Model> extends FireModelError {
    constructor(rec: Record<T>, crudAction: IFmCrudOperation, transactionId: string, e?: Error);
}
