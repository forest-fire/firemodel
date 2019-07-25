import { IDictionary } from "common-types";
import { IWatcherItem } from "./types";
/** a cache of all the watched  */
declare let watcherPool: IDictionary<IWatcherItem>;
export declare function getWatcherPool(): IDictionary<IWatcherItem>;
export declare function addToWatcherPool(item: IWatcherItem): void;
export declare function clearWatcherPool(): void;
export declare function removeFromWatcherPool(code: keyof typeof watcherPool): IDictionary<IWatcherItem>;
export {};
