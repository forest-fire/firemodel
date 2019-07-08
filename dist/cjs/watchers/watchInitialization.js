"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
/**
 * indicates which watcherId's have returned their initial
 * value.
 */
exports.hasInitialized = {};
async function waitForInitialization(watcher, timeout = 5000) {
    return new Promise(async (resolve, reject) => {
        setTimeout(() => {
            reject(new Error(`Timed out waiting for initialization of watcher "${watcher.watcherId}"`));
        }, timeout);
        while (!ready(watcher)) {
            if (ready(watcher)) {
                resolve();
            }
            else {
                await common_types_1.wait(100);
            }
        }
        resolve();
    });
}
exports.waitForInitialization = waitForInitialization;
async function ready(watcher) {
    return exports.hasInitialized[watcher.watcherId];
}
//# sourceMappingURL=watchInitialization.js.map