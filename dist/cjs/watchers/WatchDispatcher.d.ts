import { IValueBasedWatchEvent, IPathBasedWatchEvent } from "abstracted-firebase";
import { IReduxDispatch, IFmWatchEvent } from "../state-mgmt";
import { IWatcherItem, IFmLocalEvent } from "./types";
/**
 * **watchDispatcher**
 *
 * Wraps both start-time _watcher context_ and combines that with
 * event information (like the `key` and `dbPath`) to provide a rich
 * data environment for the `dispatch` function to operate with.
 */
export declare const WatchDispatcher: <T>(coreDispatchFn: IReduxDispatch<import("../state-mgmt").IReduxAction, any>) => (watcherContext: IWatcherItem<T>) => (event: IValueBasedWatchEvent | (IPathBasedWatchEvent & {
    value?: any;
}) | IFmLocalEvent<T>) => Promise<IFmWatchEvent<T>>;
