import { Model } from "../Model";
import { IFmDispatchWatchContext, IDispatchEventContext } from "../state-mgmt";
import { IFmLocalEvent } from "../watchers/types";

export type IFmEventType =
  | "value"
  | "child_added"
  | "child_moved"
  | "child_removed"
  | "child_changed";

// TODO: look at overlap between IFmContextualizedWatchEvent and IFmRecordEvent; remove one
export type IFmEvent<T extends Model = Model> = IFmLocalEvent<T> &
  IFmDispatchWatchContext &
  IDispatchEventContext;
