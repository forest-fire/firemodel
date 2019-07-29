import { IDictionary, wait } from "common-types";
import { IWatcherEventContext } from "../state-mgmt/index";
import { Model } from "../Model";

/**
 * indicates which watcherId's have returned their initial
 * value.
 */
export const hasInitialized: IDictionary<boolean> = {};

export async function waitForInitialization<T = Model>(
  watcher: IWatcherEventContext<T>,
  timeout: number = 5000
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    setTimeout(() => {
      reject(
        new Error(
          `Timed out waiting for initialization of watcher "${watcher.watcherId}"`
        )
      );
    }, timeout);
    while (!ready(watcher)) {
      if (ready(watcher)) {
        resolve();
      } else {
        await wait(100);
      }
    }
    resolve();
  });
}

async function ready<T>(watcher: IWatcherEventContext<T>) {
  return hasInitialized[watcher.watcherId];
}
