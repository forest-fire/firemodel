import { pathJoin } from "common-types";
export function enhanceEventWithWatcherData(record, watcher, event) {
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
//# sourceMappingURL=enhanceWithWatcherData.js.map