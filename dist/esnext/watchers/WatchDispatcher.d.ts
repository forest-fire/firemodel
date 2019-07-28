import { IReduxDispatch } from "../VuexWrapper";
import { IValueBasedWatchEvent, IPathBasedWatchEvent } from "abstracted-firebase";
import { IWatcherItem, IFmLocalEvent } from "./types";
import { IFmEvent } from "../@types";
/**
 * **watchDispatcher**
 *
 * Wraps both start-time _watcher context_ and combines that with
 * event information (like the `key` and `dbPath`) to provide a rich
 * data environment for the `dispatch` function to operate with.
 */
export declare const WatchDispatcher: <T>(coreDispatchFn: IReduxDispatch<import("../VuexWrapper").IReduxAction, any>) => (watcherContext: IWatcherItem<T>) => (event: IValueBasedWatchEvent | (IPathBasedWatchEvent & {
    value?: any;
}) | IFmLocalEvent<T>) => Promise<IFmEvent<T>>;
