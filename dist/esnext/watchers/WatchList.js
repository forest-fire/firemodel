import { WatchBase } from "./WatchBase";
import { List } from "../List";
import { Record } from "../Record";
import { SerializedQuery } from "@forest-fire/base-serializer";
import { getAllPropertiesFromClassStructure } from "../util";
import { Watch } from "../index";
import { FireModelError } from "../errors";
export class WatchList extends WatchBase {
    constructor() {
        super(...arguments);
        this._offsets = {};
        this._options = {};
    }
    static list(
    /**
     * The `Model` underlying the **List**
     */
    modelConstructor, 
    /**
     * optionally state the _dynamic path_ properties which offset the **dbPath**
     */
    options = {}) {
        const obj = new WatchList();
        obj.list(modelConstructor, options);
        return obj;
    }
    list(modelConstructor, options = {}) {
        this._watcherSource = "list";
        this._eventType = "child";
        this._options = options;
        if (options.offsets) {
            this._offsets = options.offsets;
        }
        const lst = List.create(modelConstructor, options);
        this._modelConstructor = modelConstructor;
        this._classProperties = getAllPropertiesFromClassStructure(new this._modelConstructor());
        this._dynamicProperties = Record.dynamicPathProperties(modelConstructor);
        this.setPathDependantProperties();
        return this;
    }
    /**
     *
     * @param offsetDict
     */
    offsets(offsetDict) {
        this._offsets = offsetDict;
        const lst = List.create(this._modelConstructor, this._options);
        this.setPathDependantProperties();
        return this;
    }
    /**
     * **ids**
     *
     * There are times where you know an array of IDs which you want to watch as a `list`
     * and calling a series of **record** watchers would not work because -- for a given model
     * -- you can only watch one (this is due to the fact that a _record_ watcher does not
     * offset the record by it's ID). This is the intended use-case for this type of _list_
     * watcher.
     *
     * It is worth noting that with this watcher the frontend will indeed get an array of
     * records but from a **Firebase** standpoint this is not a "list watcher" but instead
     * a series of "record watchers".
     *
     * @param ids the list of FK references (simple or composite)
     */
    ids(...ids) {
        if (ids.length === 0) {
            throw new FireModelError(`You attempted to setup a watcher list on a given set of ID's of "${this._modelName}" but the list of ID's was empty!`, "firemodel/not-ready");
        }
        for (const id of ids) {
            this._underlyingRecordWatchers.push(this._options.offsets
                ? Watch.record(this._modelConstructor, Object.assign(Object.assign({}, (typeof id === "string" ? { id } : id)), this._options.offsets))
                : Watch.record(this._modelConstructor, id));
        }
        this._watcherSource = "list-of-records";
        this._eventType = "value";
        return this;
    }
    /**
     * **since**
     *
     * Watch for all records that have changed since a given date
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    since(when, limit) {
        this._query = this._query.orderByChild("lastUpdated").startAt(when);
        if (limit) {
            this._query = this._query.limitToFirst(limit);
        }
        return this;
    }
    /**
     * **dormantSince**
     *
     * Watch for all records that have NOT changed since a given date (opposite of "since")
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    dormantSince(when, limit) {
        this._query = this._query.orderByChild("lastUpdated").endAt(when);
        if (limit) {
            this._query = this._query.limitToFirst(limit);
        }
        return this;
    }
    /**
     * **after**
     *
     * Watch all records that were created after a given date
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    after(when, limit) {
        this._query = this._query.orderByChild("createdAt").startAt(when);
        if (limit) {
            this._query = this._query.limitToFirst(limit);
        }
        return this;
    }
    /**
     * **before**
     *
     * Watch all records that were created before a given date
     *
     * @param when  the datetime in milliseconds or a string format that works with new Date(x)
     * @param limit  optionally limit the records returned to a max number
     */
    before(when, limit) {
        this._query = this._query.orderByChild("createdAt").endAt(when);
        if (limit) {
            this._query = this._query.limitToFirst(limit);
        }
        return this;
    }
    /**
     * **first**
     *
     * Watch for a given number of records; starting with the first/earliest records (createdAt).
     * Optionally you can state an ID from which to start from. This is useful for a pagination
     * strategy.
     *
     * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
     * @param startAt  the ID reference to a record in the list (if used for pagination, add the last record in the list to this value)
     */
    first(howMany, startAt) {
        this._query = this._query.orderByChild("createdAt").limitToFirst(howMany);
        if (startAt) {
            this._query = this._query.startAt(startAt);
        }
        return this;
    }
    /**
     * **last**
     *
     * Watch for a given number of records; starting with the last/most-recently added records
     * (e.g., createdAt). Optionally you can state an ID from which to start from.
     * This is useful for a pagination strategy.
     *
     * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
     * @param startAt  the ID reference to a record in the list (if used for pagination, add the last record in the list to this value)
     */
    last(howMany, startAt) {
        this._query = this._query.orderByChild("createdAt").limitToLast(howMany);
        if (startAt) {
            this._query = this._query.endAt(startAt);
        }
        return this;
    }
    /**
     * **recent**
     *
     * Watch for a given number of records; starting with the recent/most-recently updated records
     * (e.g., lastUpdated). Optionally you can state an ID from which to start from.
     * This is useful for a pagination strategy.
     *
     * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
     * @param startAt  the ID reference to a record in the list (if used for pagination, add the recent record in the list to this value)
     */
    recent(howMany, startAt) {
        this._query = this._query.orderByChild("lastUpdated").limitToFirst(howMany);
        if (startAt) {
            this._query = this._query.startAt(startAt);
        }
        return this;
    }
    /**
     * **inactive**
     *
     * Watch for a given number of records; starting with the inactive/most-inactively added records
     * (e.g., lastUpdated). Optionally you can state an ID from which to start from.
     * This is useful for a pagination strategy.
     *
     * @param howMany  the datetime in milliseconds or a string format that works with new Date(x)
     * @param startAt  the ID reference to a record in the list (if used for pagination, add the inactive record in the list to this value)
     */
    inactive(howMany, startAt) {
        this._query = this._query.orderByChild("lastUpdated").limitToLast(howMany);
        if (startAt) {
            this._query = this._query.endAt(startAt);
        }
        return this;
    }
    /**
     * **fromQuery**
     *
     * Watch for all records that conform to a passed in query
     *
     * @param query
     */
    fromQuery(inputQuery) {
        this._query = inputQuery;
        return this;
    }
    /**
     * **all**
     *
     * Watch for all records of a given type
     *
     * @param limit it you want to limit the results a max number of records
     */
    all(limit) {
        if (limit) {
            this._query = this._query.limitToLast(limit);
        }
        return this;
    }
    /**
     * **where**
     *
     * Watch for all records where a specified property is
     * equal, less-than, or greater-than a certain value
     *
     * @param property the property which the comparison operater is being compared to
     * @param value either just a value (in which case "equality" is the operator), or a tuple with operator followed by value (e.g., [">", 34])
     */
    where(property, value) {
        let operation = "=";
        let val;
        if (Array.isArray(value)) {
            val = value[1];
            operation = value[0];
        }
        else {
            val = value;
        }
        this._query = SerializedQuery.create(this.db, this._query.path)
            .orderByChild(property)
            // TODO: fix typing issue here.
            // @ts-ignore
            .where(operation, val);
        return this;
    }
    /**
     * Sets properties that could be effected by _dynamic paths_
     */
    setPathDependantProperties() {
        if (this._dynamicProperties.length === 0 ||
            Object.keys(this._offsets).length > 0) {
            const lst = List.create(this._modelConstructor, Object.assign(Object.assign({}, this._options), { offsets: this._offsets }));
            this._query = SerializedQuery.create(this.db, lst.dbPath);
            this._modelName = lst.modelName;
            this._pluralName = lst.pluralName;
            this._localPath = lst.localPath;
            this._localPostfix = lst.localPostfix;
        }
    }
}
//# sourceMappingURL=WatchList.js.map