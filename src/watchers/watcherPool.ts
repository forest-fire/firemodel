import { IDictionary } from "common-types";
import { IWatcherItem } from "./types";

/** a cache of all the watched  */
let watcherPool: IDictionary<IWatcherItem> = {};

export function getWatcherPool() {
  return watcherPool;
}

export function addToWatcherPool(item: IWatcherItem) {
  watcherPool[item.watcherId] = item;
}

export function clearWatcherPool() {
  watcherPool = {};
}

export function removeFromWatcherPool(code: keyof typeof watcherPool) {
  delete watcherPool[code];
  return watcherPool;
}
