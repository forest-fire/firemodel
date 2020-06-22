"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForInitialization = exports.hasInitialized = void 0;
const common_types_1 = require("common-types");
/**
 * indicates which watcherId's have returned their initial
 * value.
 */
const _hasInitialized = {};
exports.hasInitialized = (watcherId, value = true) => {
    if (watcherId) {
        _hasInitialized[watcherId] = value;
    }
    return _hasInitialized;
};
/**
 * Waits for a newly started watcher to get back the first
 * data from the watcher. This indicates that the frontend
 * and Firebase DB are now in sync.
 */
async function waitForInitialization(watcher, timeout = 750) {
    setTimeout(() => {
        if (!ready(watcher)) {
            console.info(`A watcher [ ${watcher.watcherId} ] has not returned an event in the timeout window  [ ${timeout}ms ]. This might represent an issue but can also happen when a watcher starts listening to a path [ ${watcher.watcherPaths.join(", ")} ] which has no data yet.`);
        }
        exports.hasInitialized(watcher.watcherId, "timed-out");
    }, timeout);
    while (!ready(watcher)) {
        await common_types_1.wait(50);
    }
}
exports.waitForInitialization = waitForInitialization;
function ready(watcher) {
    return exports.hasInitialized()[watcher.watcherId] ? true : false;
}
//# sourceMappingURL=watchInitialization.js.map