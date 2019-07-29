import { wait } from "common-types";
/**
 * indicates which watcherId's have returned their initial
 * value.
 */
const _hasInitialized = {};
export const hasInitialized = (watcherId) => {
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
export async function waitForInitialization(watcher, timeout = 5000) {
    return new Promise(async (resolve, reject) => {
        setTimeout(() => {
            if (!ready(watcher)) {
                reject(new Error(`Timed out waiting for initialization of watcher "${watcher.watcherId}"`));
            }
            else {
                resolve();
            }
        }, timeout);
        while (!ready(watcher)) {
            await wait(50);
        }
        resolve();
    });
}
function ready(watcher) {
    return hasInitialized()[watcher.watcherId] ? true : false;
}
//# sourceMappingURL=watchInitialization.js.map