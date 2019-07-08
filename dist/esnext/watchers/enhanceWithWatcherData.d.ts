import { IFmEvent, IWatcherItem } from "./types";
import { Record } from "../Record";
export declare function enhanceEventWithWatcherData<T>(record: Record<T>, watcher: IWatcherItem, event: IFmEvent<T>): IFmEvent<T>;
