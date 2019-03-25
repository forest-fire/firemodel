import {
  FMEvents,
  IFMRecordEvent,
  IFmCrudOperations,
  IFMRecordClientEvent
} from "../state-mgmt";

import { Record } from "../";
import { IMultiPathUpdates } from "../FireModel";
import { IDictionary } from "common-types";

// TODO: come back and type this
// export interface IWatchEventChanges<T, K extends keyof T> {
//   [prop: K]: T[K];
// }

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
export function createWatchEvent<T>(
  type: FMEvents,
  record: Record<T>,
  event: IFmLocalEventPayload<T>
) {
  const payload: IFMRecordClientEvent<T> = {
    type,
    key: record.id,
    modelName: record.modelName,
    pluralName: record.pluralName,
    modelConstructor: record.modelConstructor,
    dynamicPathProperties: record.dynamicPathComponents,
    compositeKey: record.compositeKey,
    dbPath: record.dbPath,
    localPath: record.localPath || "",
    localPostfix: record.META.localPostfix,
    ...event
  };
  return payload as IFMRecordEvent<T>;
}
