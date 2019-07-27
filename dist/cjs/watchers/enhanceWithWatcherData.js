"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const ModelMeta_1 = require("../ModelMeta");
function provideLocalEventWithWatcherContext(record, watcher, event) {
    const meta = ModelMeta_1.getModelMeta(record);
    const output = Object.assign({}, event, { watcherId: watcher.watcherId, watcherSource: watcher.watcherSource });
    event.watcher = watcher.watcherId;
    event.watcherSource = watcher.watcherSource;
    event.localPath =
        watcher.watcherSource === "record"
            ? common_types_1.pathJoin(meta.localPrefix || "", meta.localModelName)
            : common_types_1.pathJoin(meta.localPrefix || "", record.pluralName);
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
exports.provideLocalEventWithWatcherContext = provideLocalEventWithWatcherContext;
//# sourceMappingURL=enhanceWithWatcherData.js.map