import { IFmLocalEvent, IFmRecordMeta } from "@/types";

import { Record } from "@/core";

export function UnwatchedLocalEvent<T>(
  rec: Record<T>,
  event: IFmLocalEvent<T>
) {
  const meta: IFmRecordMeta<T> = {
    dynamicPathProperties: rec.dynamicPathComponents,
    compositeKey: rec.compositeKey,
    modelConstructor: rec.modelConstructor,
    modelName: rec.modelName,
    pluralName: rec.pluralName,
    localModelName: rec.META.localModelName,
    localPath: rec.localPath,
    localPostfix: rec.META.localPostfix,
  };

  return { ...event, ...meta, dbPath: rec.dbPath, watcherSource: "unknown" };
}
