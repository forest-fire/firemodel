import { IFmEvent, IWatcherItem } from "./types";
import { Record } from "../Record";
import { pathJoin } from "common-types";
import { getModelMeta } from "../ModelMeta";

export function enhanceEventWithWatcherData<T>(
  record: Record<T>,
  watcher: IWatcherItem,
  event: IFmEvent<T>
) {
  const meta = getModelMeta(record);
  event.watcher = watcher.watcherId;
  event.watcherSource = watcher.watcherSource;

  event.localPath =
    watcher.watcherSource === "record"
      ? pathJoin(meta.localPrefix || "", meta.localModelName)
      : pathJoin(meta.localPrefix || "", record.pluralName);
  if (watcher.watcherSource === "list") {
    event.localPostfix = meta.localPostfix;
  }
  event.localPrefix = meta.localPrefix;

  return event;
}
