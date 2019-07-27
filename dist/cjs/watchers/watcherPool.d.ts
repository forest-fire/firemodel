import { IDictionary } from "common-types";
import { IWatcherItem } from "./types";
import { IReduxDispatch } from "../VuexWrapper";
/** a cache of all the watched  */
declare let watcherPool: IDictionary<IWatcherItem>;
export declare function getWatcherPool(): IDictionary<IWatcherItem>;
export declare function addToWatcherPool(item: IWatcherItem): void;
export declare function clearWatcherPool(): void;
/**
 * Each watcher must have it's own `dispatch()` function which
 * is reponsible for capturing the "context". This will be used
 * both by locally originated events (which have more info) and
 * server based events.
 */
export declare function addDispatchForWatcher(code: keyof typeof watcherPool, dispatch: IReduxDispatch): void;
export declare function removeFromWatcherPool(code: keyof typeof watcherPool): IDictionary<IWatcherItem>;
export {};
