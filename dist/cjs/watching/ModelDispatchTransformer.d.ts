import { IReduxDispatch } from "../VuexWrapper";
import { IValueBasedWatchEvent, IPathBasedWatchEvent } from "abstracted-firebase";
import { IFmDispatchWatchContext, IFmContextualizedWatchEvent } from "../state-mgmt";
/**
 * Contextualizes dispatches from abstracted-firebase into Model aware messages
 */
export declare const ModelDispatchTransformer: <T>(context: IFmDispatchWatchContext<T>) => (clientHandler: IReduxDispatch<IFmContextualizedWatchEvent<T>>) => (event: IValueBasedWatchEvent & IPathBasedWatchEvent) => void;
