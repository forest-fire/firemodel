"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
function enhanceEventWithWatcherData(record, watcher, event) {
    event.watcher = watcher.watcherId;
    event.watcherSource = watcher.watcherSource;
    event.localPath =
        watcher.watcherSource === "list"
            ? common_types_1.pathJoin(record.META.localPrefix, record.pluralName)
            : common_types_1.pathJoin(record.META.localPrefix, record.META.localModelName);
    if (watcher.watcherSource === "list") {
        event.localPostfix = record.META.localPostfix;
    }
    return event;
}
exports.enhanceEventWithWatcherData = enhanceEventWithWatcherData;
//# sourceMappingURL=enhanceWithWatcherData.js.map