import { IFmEvent, IWatcherItem } from "./types";
import { Record } from "../Record";
import { pathJoin, IDictionary } from "common-types";
import { getModelMeta } from "../ModelMeta";
import { IFmRecordEvent } from "../@types/watcher-types";

export function provideLocalEventWithWatcherContext<T, K = IFmRecordEvent<T>>(
  record: Record<T>,
  watcher: IWatcherItem,
  event: IFmEvent<T>
) {
  const meta = getModelMeta(record);
  const output: IDictionary = {
    ...event,
    watcherId: watcher.watcherId,
    watcherSource: watcher.watcherSource
  };
  event.watcher = watcher.watcherId;
  event.watcherSource = watcher.watcherSource;

  event.localPath =
    watcher.watcherSource === "record"
      ? pathJoin(meta.localPrefix || "", meta.localModelName)
      : pathJoin(meta.localPrefix || "", record.pluralName);

  if (watcher.watcherSource === "list") {
    event.localPostfix = meta.localPostfix;
  }
  if (watcher.watcherSource === "list-of-records") {
    output.dbPath = record.dbPath;
    output.query = watcher.query.find(q => ((q as any)._path = record.dbPath));
  }

  output.localPrefix = meta.localPrefix;

  return output as K;
}
