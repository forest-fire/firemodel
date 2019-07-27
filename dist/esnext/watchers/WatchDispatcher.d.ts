import { IReduxDispatch } from "../VuexWrapper";
import { IValueBasedWatchEvent, IPathBasedWatchEvent } from "abstracted-firebase";
import { IFmDispatchWatchContextBase } from "../state-mgmt";
import { IFmRecordEvent } from "../@types";
/**
 * **watchDispatcher**
 *
 * Wraps Firebase event detail (meager) with as much context as is possible
 */
export declare const WatchDispatcher: <T>(watcherContext: IFmDispatchWatchContextBase<T>) => (coreDispatchFn: IReduxDispatch<import("../VuexWrapper").IReduxAction, any>) => (event: IValueBasedWatchEvent & IPathBasedWatchEvent & IFmRecordEvent<T>) => Promise<any>;
