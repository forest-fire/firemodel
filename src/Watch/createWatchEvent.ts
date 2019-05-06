import { FMEvents, IFMRecordEvent, IFMRecordClientEvent } from "../state-mgmt";

import { Record } from "..";
import { IFmEvent } from "./types";
/**
 * expands a locally originated event into a full featured
 * dispatch event with desired META from the model
 */
export function createWatchEvent<T>(
  type: FMEvents,
  record: Record<T>,
  event: IFmEvent<T>
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
