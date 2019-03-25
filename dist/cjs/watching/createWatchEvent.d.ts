import { FMEvents, IFMRecordEvent, IFmCrudOperations } from "../state-mgmt";
import { Record } from "../";
import { IMultiPathUpdates } from "../FireModel";
import { IDictionary } from "common-types";
export interface IFmLocalEventPayload<T> {
    transactionId: string;
    crudAction?: IFmCrudOperations;
    value: T;
    paths?: IMultiPathUpdates[];
    changed?: IDictionary;
    priorValue?: T;
    errorCode?: string | number;
    errorMessage?: string;
}
/**
 * expands a locally originated event into a full featured
 * dispatch event with desired META from the model
 */
export declare function createWatchEvent<T>(type: FMEvents, record: Record<T>, event: IFmLocalEventPayload<T>): IFMRecordEvent<T>;
