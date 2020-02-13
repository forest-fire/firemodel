import { FireModelError } from "../FireModelError";
import { Record } from "../../Record";
import { Model } from "../../models/Model";
import { IFmCrudOperation } from "../../state-mgmt";
export declare class RecordCrudFailure<T extends Model> extends FireModelError {
    constructor(rec: Record<T>, crudAction: IFmCrudOperation, transactionId: string, e?: Error);
}
