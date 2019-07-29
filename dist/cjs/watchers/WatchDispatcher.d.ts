import { IValueBasedWatchEvent, IPathBasedWatchEvent } from "abstracted-firebase";
import { IReduxDispatch, IFmWatchEvent, IWatcherEventContext } from "../state-mgmt";
/**
 * **watchDispatcher**
 *
 * Wraps both start-time _watcher context_ and combines that with
 * event information (like the `key` and `dbPath`) to provide a rich
 * data environment for the `dispatch` function to operate with.
 */
export declare const WatchDispatcher: <T>(coreDispatchFn: IReduxDispatch<import("../state-mgmt").IReduxAction, any>) => (watcherContext: IWatcherEventContext<T>) => (event: IValueBasedWatchEvent | (IPathBasedWatchEvent & {
    value?: any;
}) | import("../state-mgmt").IFmLocalRecordEvent<T> | import("../state-mgmt").IFmLocalRelationshipEvent<T>) => Promise<IFmWatchEvent<T>>;
