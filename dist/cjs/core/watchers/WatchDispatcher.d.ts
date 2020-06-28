import { IFmServerOrLocalEvent, IFmWatchEvent, IReduxDispatch, IWatcherEventContext } from "../../types";
/**
 * **watchDispatcher**
 *
 * Wraps both start-time _watcher context_ and combines that with
 * event information (like the `key` and `dbPath`) to provide a rich
 * data environment for the `dispatch` function to operate with.
 */
export declare const WatchDispatcher: <T>(coreDispatchFn: IReduxDispatch) => (watcherContext: IWatcherEventContext<T>) => (event: IFmServerOrLocalEvent<T>) => Promise<IFmWatchEvent<T>>;
