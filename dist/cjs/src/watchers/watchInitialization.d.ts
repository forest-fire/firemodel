import { IDictionary } from "common-types";
import { IWatcherItem } from "./types";
/**
 * indicates which watcherId's have returned their initial
 * value.
 */
export declare const hasInitialized: IDictionary<boolean>;
export declare function waitForInitialization(watcher: IWatcherItem, timeout?: number): Promise<void>;
