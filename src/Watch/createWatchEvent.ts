import { FmEvents, IFMRecordClientEvent } from "../state-mgmt";

import { Record, IFmRecordEvent } from "..";
import { IFmEvent } from "./types";
/**
 * expands a locally originated event into a full featured
 * dispatch event with desired META from the model
 */
export function createWatchEvent<T>(
  type: FmEvents,
  record: Record<T>,
  event: IFmEvent<T>
) {
  const payload: IFmRecordEvent<T> = {
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
  return payload;
}
