import { IDictionary } from "common-types";
import { IWatcherEventContext } from "../state-mgmt/index";
import { Model } from "../Model";
/**
 * indicates which watcherId's have returned their initial
 * value.
 */
export declare const hasInitialized: IDictionary<boolean>;
export declare function waitForInitialization<T = Model>(watcher: IWatcherEventContext<T>, timeout?: number): Promise<void>;
