import { FmEvents, IFmCrudOperations } from "./index";
// tslint:disable-next-line: no-implicit-dependencies
import { EventType } from "@firebase/database-types";
import { IMultiPathUpdates } from "../FireModel";
import { Model } from "../Model";

export interface IFmLocalEventBase<T> {
  /** a FireModel event must state a type */
  type: FmEvents;
  /** same as `value.id` but added to provide consistency to Firebase events */
  key: string;
  /**
   * A Unique ID for the given event payload
   */
  transactionId: string;
  /**
   * the specific CRUD action being performed
   */
  crudAction?: IFmCrudOperations;
  eventType: EventType | "local";
  /**
   * The event's payload value; this will be returned in all "value based"
   * events but not in "path based" events like relationship changes which
   * effect multiple records
   */
  value?: T;
  /**
   * **paths**
   *
   * Optionally including the full set of paths that are being updated;
   * this is included because _multi-path-sets_ are used to set not only
   * a given record but also it's FK relationships when a relationship is
   * changed. In the localized event this points to paths which will resolve
   * to two server based changes (one to the primary model, one to the FK
   * model) while maintaining the overall set operation as an atomic transaction
   */
  paths?: IMultiPathUpdates[];
  /**
   * **changed**
   *
   * An array of property names who's value has changed
   */
  changed?: Array<keyof T>;
  added?: Array<keyof T>;
  removed?: Array<keyof T>;
  /**
   * **priorValue**
   *
   * When a locally originated "update" is done the `changed` property will
   * be a hash where all the keys represent _changed_ values and the value is
   * the old/prior value.
   */
  priorValue?: T;

  errorCode?: string | number;
  errorMessage?: string;
}

/**
 * The explicit shape of a IFmLocalEvent which convey's a relationship
 * change.
 */
export interface IFmRelationshipEvent<T extends Model = Model>
  extends IFmLocalEventBase<T> {
  value: undefined;
  paths: IMultiPathUpdates[];
}

/**
 * Meta information for events that are originated from **Firemodel**. This event
 * type is then extended with _watcher context_
 */
export interface IFmLocalEvent<T> {
  /** a FireModel event must state a type */
  type: FmEvents;
  /** same as `value.id` but added to provide consistency to Firebase events */
  key: string;
  /**
   * A Unique ID for the given event payload
   */
  transactionId: string;
  /**
   * the specific CRUD action being performed
   */
  crudAction?: IFmCrudOperations;
  eventType: EventType | "local";
  /**
   * The event's payload value
   */
  value: T;
  /**
   * **paths**
   *
   * Optionally including the full set of paths that are being updated;
   * this is included because _multi-path-sets_ are used to set not only
   * a given record but also it's FK relationships when a relationship is
   * changed. In the localized event this points to paths which will resolve
   * to two server based changes (one to the primary model, one to the FK
   * model) while maintaining the overall set operation as an atomic transaction
   */
  paths?: IMultiPathUpdates[];
  /**
   * **changed**
   *
   * An array of property names who's value has changed
   */
  changed?: Array<keyof T>;
  added?: Array<keyof T>;
  removed?: Array<keyof T>;
  /**
   * **priorValue**
   *
   * When a locally originated "update" is done the `changed` property will
   * be a hash where all the keys represent _changed_ values and the value is
   * the old/prior value.
   */
  priorValue?: T;

  errorCode?: string | number;
  errorMessage?: string;
}
