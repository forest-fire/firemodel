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
export async function waitForInitialization(watcher, timeout = 3000) {
    setTimeout(() => {
        console.log("hasInitialized (at pt of timeout):", hasInitialized());
        if (!ready(watcher)) {
            throw new Error(`Timed out waiting for initialization of watcher "${watcher.watcherId}"`);
        }
    }, timeout);
    while (!ready(watcher)) {
        await wait(50);
    }
}
function ready(watcher) {
    return hasInitialized()[watcher.watcherId] ? true : false;
}
//# sourceMappingURL=watchInitialization.js.map