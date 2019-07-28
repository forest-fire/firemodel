import { IDictionary } from "common-types";
import { IReduxDispatch, IWatcherItem } from "../state-mgmt";
/** a cache of all the watched  */
declare let watcherPool: IDictionary<IWatcherItem<any>>;
export declare function getWatcherPool(): IDictionary<IWatcherItem<any>>;
export declare function addToWatcherPool<T = IWatcherItem<any>>(item: IWatcherItem<T>): void;
export declare function getFromWatcherPool(code: keyof typeof watcherPool): IWatcherItem<any>;
export declare function clearWatcherPool(): void;
/**
 * Each watcher must have it's own `dispatch()` function which
 * is reponsible for capturing the "context". This will be used
 * both by locally originated events (which have more info) and
 * server based events.
 */
export declare function addDispatchForWatcher(code: keyof typeof watcherPool, dispatch: IReduxDispatch): void;
export declare function removeFromWatcherPool(code: keyof typeof watcherPool): IDictionary<IWatcherItem<any>>;
export {};
