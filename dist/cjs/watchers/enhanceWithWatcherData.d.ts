import { IFmEvent, IWatcherItem } from "./types";
import { Record } from "../Record";
import { IFmRecordEvent } from "../@types/watcher-types";
export declare function provideLocalEventWithWatcherContext<T, K = IFmRecordEvent<T>>(record: Record<T>, watcher: IWatcherItem, event: IFmEvent<T>): K;
