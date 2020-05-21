import { Model } from "./models/Model";
import { IReduxDispatch, IWatcherEventContext } from "./state-mgmt";
import { IModelOptions } from "./@types/general";
import { IPrimaryKey } from "./@types/record-types";
import { WatchList } from "./watchers/WatchList";
import { WatchRecord } from "./watchers/WatchRecord";
import { AbstractedDatabase } from "@forest-fire/abstracted-database";
/**
 * A static library for interacting with _watchers_. It
 * provides the entry point into the watcher API and then
 * hands off to either `WatchList` or `WatchRecord`.
 */
export declare class Watch<T extends Model = Model> {
    /**
     * Sets the default database for all Firemodel
     * classes such as `FireModel`, `Record`, and `List`
     */
    static set defaultDb(db: AbstractedDatabase);
    /**
     * Sets the default dispatch for all Firemodel
     * classes such as `FireModel`, `Record`, and `List`
     */
    static set dispatch(d: IReduxDispatch);
    /**
     * returns a full list of all watchers
     */
    static get inventory(): import("common-types").IDictionary<IWatcherEventContext<any>>;
    static toJSON(): import("common-types").IDictionary<IWatcherEventContext<any>>;
    /**
     * lookup
     *
     * Allows the lookup of details regarding the actively watched
     * objects in the Firebase database
     *
     * @param hashCode the unique hashcode given for each watcher
     */
    static lookup(hashCode: string): IWatcherEventContext;
    static get watchCount(): number;
    static reset(): void;
    /**
     * Finds the watcher by a given name and returns the ID of the
     * first match
     */
    static findByName(name: string): string;
    /**
     * stops watching either a specific watcher or ALL if no hash code is provided
     */
    static stop(hashCode?: string, oneOffDB?: AbstractedDatabase): void;
    /**
     * Configures the watcher to be a `value` watcher on Firebase
     * which is only concerned with changes to a singular Record.
     *
     * @param pk the _primary key_ for a given record. This can be a string
     * represention of the `id` property, a string represention of
     * the composite key, or an object representation of the composite
     * key.
     */
    static record<T extends Model>(modelConstructor: new () => T, pk: IPrimaryKey<T>, options?: IModelOptions): WatchRecord<T>;
    static list<T extends Model>(
    /**
     * The **Model** subType which this list watcher will watch
     */
    modelConstructor: new () => T, 
    /**
     * optionally state the _dynamic path_ properties which offset the **dbPath**
     */
    offsets?: Partial<T>): WatchList<T>;
}
