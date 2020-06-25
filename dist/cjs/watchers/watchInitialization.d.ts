import { IDictionary } from "common-types";
import { IWatcherEventContext, Model } from "../private";
export declare const hasInitialized: (watcherId?: string, value?: true | "timed-out") => IDictionary<boolean | "timed-out">;
/**
 * Waits for a newly started watcher to get back the first
 * data from the watcher. This indicates that the frontend
 * and Firebase DB are now in sync.
 */
export declare function waitForInitialization<T = Model>(watcher: IWatcherEventContext<T>, timeout?: number): Promise<void>;
