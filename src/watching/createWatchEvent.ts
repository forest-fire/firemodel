import { FMEvents } from "../state-mgmt";
import { IDictionary } from "common-types";

export default function createWatchEvent(
  type: keyof FMEvents,
  recordContext: IDictionary
) {
  // const payload: Partial<IFMRecordEvent<T>> = {
  //   type,
  //   modelName: record.modelName,
  //   modelConstructor: record._modelConstructor,
  //   dbPath: record.dbPath,
  //   compositeKey: record.compositeKey,
  //   localPath: record.localPath,
  //   key: record.id
  // };
  // if (Array.isArray(pathsOrValue)) {
  //   payload.paths = pathsOrValue;
  // } else {
  //   payload.value = pathsOrValue;
  // }
  // return payload as IFMRecordEvent<T>;
}
