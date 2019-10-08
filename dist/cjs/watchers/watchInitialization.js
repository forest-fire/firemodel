"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
/**
 * indicates which watcherId's have returned their initial
 * value.
 */
const _hasInitialized = {};
exports.hasInitialized = (watcherId) => {
    if (watcherId) {
        _hasInitialized[watcherId] = true;
    }
    return _hasInitialized;
};
/**
 * Waits for a newly started watcher to get back the first
 * data from the watcher. This indicates that the frontend
 * and Firebase DB are now in sync.
 */
async function waitForInitialization(watcher, timeout = 1500) {
    setTimeout(() => {
        if (!ready(watcher)) {
            console.log(exports.hasInitialized());
            console.log(watcher);
            throw new Error(`Timed out waiting for initialization of watcher "${watcher.watcherId}"`);
        }
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