import { FmEvents, IFMRecordEvent } from "../state-mgmt";
import { Record } from "..";
import { IFmEvent } from "./types";
/**
 * expands a locally originated event into a full featured
 * dispatch event with desired META from the model
 */
export declare function createWatchEvent<T>(type: FmEvents, record: Record<T>, event: IFmEvent<T>): IFMRecordEvent<T>;
