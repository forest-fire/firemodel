import { FmEvents, IFmCrudOperations } from "./index";
import { EventType } from "@firebase/database-types";
import { IMultiPathUpdates } from "../FireModel";
import { Model } from "../Model";
import { IFmRelationshipOperation, IFmPathValuePair } from "../@types";
import { fk, pk } from "common-types";
/**
 * All local events should provide the following meta
 */
export interface IFmLocalEventBase<T> {
    /** a FireModel event must state a type */
    type: FmEvents;
    /** the key of the record; if composite key then will take composite-reference format */
    key: pk;
    /**
     * A Unique ID for the given event payload
     */
    transactionId: string;
    eventType: EventType | "local";
    /**
     * The event's payload value; this will be returned in all "value based"
     * events but not in "path based" events like relationship changes which
     * effect multiple records
     */
    value?: T;
    paths?: IMultiPathUpdates[];
    errorCode?: string | number;
    errorMessage?: string;
}
/**
 * **IFmLocalRelationshipEvent**
 *
 * The explicit shape of a IFmLocalEvent which convey's a **relationship**
 * change.
 *
 * Like Record events, there is the concept of a two-phased commit
 * where the first phase is an _optimistic_ expression of what "sucess"
 * would look like and the second phase is a _confirmation_ or _rollback_ event.
 *
 * **Note:** the concept of a "relationship" is purely a local/Firemodel convention.
 * The server events that a relationship change results in `RECORD_CHANGED` events
 * on both effected records.
 */
export interface IFmLocalRelationshipEvent<F extends Model = Model, T extends Model = Model> extends IFmLocalEventBase<F> {
    kind: "relationship";
    operation: IFmRelationshipOperation;
    /** the property on the `from` model which has a FK ref to `to` model */
    property: keyof F & string;
    /**
     * The foreign key that the `from` model will be operating with on property `property`.
     * If the FK has a dynamic path then the FK will be represented as a composite ref.
     */
    fks: fk[];
    /** the property on the `to` model which points back to the `from` model */
    inverseProperty?: keyof T;
    /**
     * the model name of the `from` part of a relationship
     */
    from: string;
    /**
     * the model name of the `to` part of a relationship
     */
    to: string;
    /** the `localPath` of the _"from"_ part of the relationship */
    fromLocal: string;
    /** the `localPath` of the _"to"_ part of the relationship */
    toLocal: string;
    /** a constructor for the model of the _"from"_ record */
    fromConstructor: new () => F;
    /** a constructor for the model of the _"to"_ record */
    toConstructor: new () => T;
    value?: undefined;
    /**
     * **paths**
     *
     * The database paths which are effected by this relationship event.
     * The paths can impact one or two `Record`'s (based on whether the
     * foreign record has an "inverse" property)
     */
    paths: IFmPathValuePair[];
}
/**
 * Core event properties of a `Record` based change in **Firemodel**
 */
export interface IFmLocalRecordEvent<T extends Model = Model> extends IFmLocalEventBase<T> {
    kind: "record";
    operation: IFmCrudOperations;
    modelConstructor: new () => T;
    value: T;
    /**
     * **changed**
     *
     * An array of property names who's value has _changed_;
     * this is only available when the operation is set to
     * `update`.
     */
    changed?: Array<keyof T>;
    /**
     * **added**
     *
     * An array of property names who's value has been _added_;
     * this is only available when the operation is set to
     * `update`.
     */
    added?: Array<keyof T>;
    /**
     * **removed**
     *
     * An array of property names who's value has been _removed_;
     * this is only available when the operation is set to
     * `update`.
     */
    removed?: Array<keyof T>;
    /**
     * **priorValue**
     *
     * When a locally originated "update" is done the `changed` property will
     * be a hash where all the keys represent _changed_ values and the value is
     * the old/prior value.
     */
    priorValue?: T;
}
/**
 * Meta information for events that are originated from **Firemodel**. This event
 * type is then extended with _watcher context_
 */
export declare type IFmLocalEvent<T> = IFmLocalRecordEvent<T> | IFmLocalRelationshipEvent<T>;
