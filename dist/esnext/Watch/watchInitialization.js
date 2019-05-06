import { wait } from "common-types";
/**
 * indicates which watcherId's have returned their initial
 * value.
 */
export const hasInitialized = {};
export async function waitForInitialization(watcher, timeout = 5000) {
    return new Promise(async (resolve, reject) => {
        setTimeout(() => {
            reject(new Error(`Timed out waiting for initialization of watcher "${watcher.watcherId}"`));
        }, timeout);
        while (!ready(watcher)) {
            if (ready(watcher)) {
                resolve();
            }
            else {
                await wait(100);
            }
        }
        resolve();
    });
}
async function ready(watcher) {
    return hasInitialized[watcher.watcherId];
}
//# sourceMappingURL=watchInitialization.js.map