import { pathJoin } from "common-types";
import { getModelMeta } from "../ModelMeta";
export function enhanceEventWithWatcherData(record, watcher, event) {
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
//# sourceMappingURL=enhanceWithWatcherData.js.map