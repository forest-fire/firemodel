import { IFmEvent, IWatcherItem } from "./types";
import { Record } from "../Record";
import { pathJoin } from "common-types";

export function enhanceEventWithWatcherData<T>(
  record: Record<T>,
  watcher: IWatcherItem,
  event: IFmEvent<T>
) {
  event.watcher = watcher.watcherId;
  event.watcherSource = watcher.watcherSource;
  event.localPath =
    watcher.watcherSource === "list"
      ? pathJoin(record.META.localPrefix, record.pluralName)
      : pathJoin(record.META.localPrefix, record.META.localModelName);
  if (watcher.watcherSource === "list") {
    event.localPostfix = record.META.localPostfix;
  }
  event.localPrefix = record.META.localPrefix;

  return event;
}
