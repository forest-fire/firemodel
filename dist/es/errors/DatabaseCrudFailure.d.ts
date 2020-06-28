import { IFmCrudOperation, IModel } from "../@types/index";
import { FireModelError } from "./";
import { Record } from "../core";
export declare class RecordCrudFailure<T extends IModel> extends FireModelError {
    constructor(rec: Record<T>, crudAction: IFmCrudOperation, transactionId: string, e?: Error);
}
