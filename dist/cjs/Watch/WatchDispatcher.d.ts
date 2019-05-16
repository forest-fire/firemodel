import { IReduxDispatch } from "../VuexWrapper";
import { IValueBasedWatchEvent, IPathBasedWatchEvent } from "abstracted-firebase";
import { IFmDispatchWatchContext, IFmContextualizedWatchEvent } from "../state-mgmt";
/**
 * **watchDispatcher**
 *
 * Wraps Firebase event detail (meager) with as much context as is possible
 */
export declare const WatchDispatcher: <T>(context: IFmDispatchWatchContext<T>) => (clientHandler: IReduxDispatch<IFmContextualizedWatchEvent<T>>) => (event: IValueBasedWatchEvent & IPathBasedWatchEvent) => void;
