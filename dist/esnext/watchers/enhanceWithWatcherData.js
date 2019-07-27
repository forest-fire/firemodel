import { pathJoin } from "common-types";
import { getModelMeta } from "../ModelMeta";
export function provideLocalEventWithWatcherContext(record, watcher, event) {
    const meta = getModelMeta(record);
    const output = Object.assign({}, event, { watcherId: watcher.watcherId, watcherSource: watcher.watcherSource });
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
        output.query = watcher.query.find(q => (q._path = record.dbPath));
    }
    output.localPrefix = meta.localPrefix;
    return output;
}
//# sourceMappingURL=enhanceWithWatcherData.js.map