import { IReduxDispatch, IWatcherEventContext } from "@/types";

import { IDictionary } from "common-types";
import { hashToArray } from "typed-conversions";

/** a cache of all the watched  */
let watcherPool: IDictionary<IWatcherEventContext<any>> = {};

export function getWatcherPool() {
  return watcherPool;
}

export function getWatcherPoolList() {
  return hashToArray(getWatcherPool());
}

export function addToWatcherPool<T = IWatcherEventContext<any>>(
  item: IWatcherEventContext<T>
) {
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
