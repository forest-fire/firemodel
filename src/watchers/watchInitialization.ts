import { IDictionary, wait } from "common-types";
import { IWatcherEventContext } from "../state-mgmt/index";
import { Model } from "../Model";

/**
 * indicates which watcherId's have returned their initial
 * value.
 */
const _hasInitialized: IDictionary<boolean> = {};
export const hasInitialized = (watcherId?: string) => {
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
export async function waitForInitialization<T = Model>(
  watcher: IWatcherEventContext<T>,
  timeout: number = 5000
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    setTimeout(() => {
      if (!ready(watcher)) {
        reject(
          new Error(
            `Timed out waiting for initialization of watcher "${watcher.watcherId}"`
          )
        );
      } else {
        resolve();
      }
    }, timeout);
    while (!ready(watcher)) {
      await wait(50);
    }

    resolve();
  });
}

function ready<T>(watcher: IWatcherEventContext<T>) {
  return hasInitialized()[watcher.watcherId] ? true : false;
}
