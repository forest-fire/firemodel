import { FireModelError, IFmCrudOperation, Model, Record } from "../../private";
export declare class RecordCrudFailure<T extends Model> extends FireModelError {
    constructor(rec: Record<T>, crudAction: IFmCrudOperation, transactionId: string, e?: Error);
}
