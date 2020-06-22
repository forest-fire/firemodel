import { WatchList } from "./WatchList";
import { WatchRecord } from "./WatchRecord";
/**
 * allows the parent `Watch` class to instantiate
 * subclasses without having a circular dependency
 */
export function getWatchList() {
    return new WatchList();
}
/**
 * allows the parent `Watch` class to instantiate
 * subclasses without having a circular dependency
 */
export function getWatchRecord() {
    return new WatchRecord();
}
//# sourceMappingURL=watchSubclasses.js.map