"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const ModelMeta_1 = require("../ModelMeta");
function enhanceEventWithWatcherData(record, watcher, event) {
    const meta = ModelMeta_1.getModelMeta(record);
    event.watcher = watcher.watcherId;
    event.watcherSource = watcher.watcherSource;
    event.localPath =
        watcher.watcherSource === "list"
            ? common_types_1.pathJoin(meta.localPrefix || "", record.pluralName)
            : common_types_1.pathJoin(meta.localPrefix || "", meta.localModelName);
    if (watcher.watcherSource === "list") {
        event.localPostfix = meta.localPostfix;
    }
    event.localPrefix = meta.localPrefix;
    return event;
}
exports.enhanceEventWithWatcherData = enhanceEventWithWatcherData;
//# sourceMappingURL=enhanceWithWatcherData.js.map