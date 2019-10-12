import { wait } from "common-types";
/**
 * indicates which watcherId's have returned their initial
 * value.
 */
const _hasInitialized = {};
export const hasInitialized = (watcherId, value = true) => {
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
export async function waitForInitialization(watcher, timeout = 750) {
    setTimeout(() => {
        if (!ready(watcher)) {
            console.info(`A watcher [ ${watcher.watcherId} ] has not returned an event in the timeout window  [ ${timeout}ms ]. This might represent an issue but can also happen when a watcher starts listening to a path [ ${watcher.watcherPaths.join(", ")} ] which has no data yet.`);
        }
        hasInitialized(watcher.watcherId, "timed-out");
    }, timeout);
    while (!ready(watcher)) {
        await wait(50);
    }
}
function ready(watcher) {
    return hasInitialized()[watcher.watcherId] ? true : false;
}
//# sourceMappingURL=watchInitialization.js.map