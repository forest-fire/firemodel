import { IDictionary } from "common-types";
import { IWatcherItem } from "./types";
import { IReduxDispatch } from "../state-mgmt";

/** a cache of all the watched  */
let watcherPool: IDictionary<IWatcherItem<any>> = {};

export function getWatcherPool() {
  return watcherPool;
}

export function addToWatcherPool<T = IWatcherItem<any>>(item: IWatcherItem<T>) {
  watcherPool[item.watcherId] = item;
}

export function getFromWatcherPool(code: keyof typeof watcherPool) {
  return watcherPool[code];
}

export function clearWatcherPool() {
  watcherPool = {};
}

/**
 * Each watcher must have it's own `dispatch()` function which
 * is reponsible for capturing the "context". This will be used
 * both by locally originated events (which have more info) and
 * server based events.
 */
export function addDispatchForWatcher(
  code: keyof typeof watcherPool,
  dispatch: IReduxDispatch
) {
  //
}

export function removeFromWatcherPool(code: keyof typeof watcherPool) {
  delete watcherPool[code];
  return watcherPool;
}
