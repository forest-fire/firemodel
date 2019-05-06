import { IReduxDispatch } from "../VuexWrapper";
import { IValueBasedWatchEvent, IPathBasedWatchEvent } from "abstracted-firebase";
import { IFmDispatchWatchContext, IFmContextualizedWatchEvent } from "../state-mgmt";
/**
 * **watchDispatcher**
 *
 * Wraps up context captured at watch conception with
 */
export declare const WatchDispatcher: <T>(context: IFmDispatchWatchContext<T>) => (clientHandler: IReduxDispatch<IFmContextualizedWatchEvent<T>>) => (event: IValueBasedWatchEvent & IPathBasedWatchEvent) => void;
