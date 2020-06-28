import { WatchList, WatchRecord } from "./index";

/**
 * allows the parent `Watch` class to instantiate
 * subclasses without having a circular dependency
 */
export function getWatchList<T>() {
  return new WatchList<T>();
}

/**
 * allows the parent `Watch` class to instantiate
 * subclasses without having a circular dependency
 */
export function getWatchRecord<T>() {
  return new WatchRecord<T>();
}
