import { IDictionary, wait } from "common-types";
import { IWatcherItem } from "./types";
import { read } from "fs";

/**
 * indicates which watcherId's have returned their initial
 * value.
 */
export const hasInitialized: IDictionary<boolean> = {};

export async function waitForInitialization(
  watcher: IWatcherItem,
  timeout: number = 5000
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    setTimeout(() => {
      reject(
        new Error(
          `Timed out waiting for initialization of watcher "${
            watcher.watcherId
          }"`
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

async function ready(watcher: IWatcherItem) {
  return hasInitialized[watcher.watcherId];
}
