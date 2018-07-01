import { Model } from "./Model";
import { IModelMetaProperties, IModelPropertyMeta } from "./index";
declare type Record<T> = import("./Record").Record<T>;
import { IDictionary } from "common-types";
import { IFMRecordEvent, FMEvents, NotString, Extractable } from "./state-mgmt";
import { IReduxDispatch } from "./VuexWrapper";
import { IModelRelationshipMeta } from "./decorators/schema";
export declare class FireModel<T extends Model> {
  static auditLogs: string;
  static isBeingWatched(path: string): boolean;
  private static _defaultDb;
  private static _dispatchActive;
  /** the dispatch function used to interact with frontend frameworks */
  private static _dispatch;
  static defaultDb: import("abstracted-firebase").RealTimeDB;
  static dispatch: IReduxDispatch;
  /** the data structure/model that this class operates around */
  protected _model: T;
  protected _modelConstructor: new () => T;
  protected _db: import("abstracted-firebase").RealTimeDB;
  readonly modelName: string;
  readonly pluralName: any;
  readonly dbPath: string;
  readonly localPath: string;
  readonly META: IModelMetaProperties<T>;
  readonly properties: IModelPropertyMeta[];
  readonly relationships: IModelRelationshipMeta[];
  readonly dispatch: IReduxDispatch;
  readonly dispatchIsActive: boolean;
  /** the connected real-time database */
  readonly db: import("abstracted-firebase").RealTimeDB;
  readonly pushKeys: string[];
  /**
   * Creates a Redux-styled event
   */
  protected _createRecordEvent<
    K extends string & NotString<K> & Extractable<FMEvents, K>
  >(
    record: Record<T>,
    type: K,
    pathsOrValue: IMultiPathUpdates[] | T
  ): IFMRecordEvent<T>;
  protected _getPaths(changes: IDictionary): IMultiPathUpdates[];
}
export interface IMultiPathUpdates {
  path: string;
  value: any;
}
export {};
