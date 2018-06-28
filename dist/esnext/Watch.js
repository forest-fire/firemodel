import { SerializedQuery } from "serialized-query";
import { FireModel } from "./FireModel";
import { Record } from "./Record";
import { ModelDispatchTransformer } from "./ModelDispatchTransformer";
import { List } from "./List";
/** a cache of all the watched  */
let watcherPool = {};
export class Watch {
    static set defaultDb(db) {
        FireModel.defaultDb = db;
    }
    /**
     * lookup
     *
     * Allows the lookup of details regarding the actively watched
     * objects in the Firebase database
     *
     * @param hashCode the unique hashcode given for each watcher
     */
    static lookup(hashCode) {
        const codes = new Set(Object.keys(watcherPool));
        if (!codes.has(hashCode)) {
            const e = new Error(`You looked up an invalid watcher hashcode [${hashCode}].`);
            e.name = "FireModel::InvalidHashcode";
            throw e;
        }
        return watcherPool[hashCode];
    }
    static get watchCount() {
        return Object.keys(watcherPool).length;
    }
    static reset() {
        watcherPool = {};
    }
    static stop(hashCode, oneOffDB) {
        const codes = new Set(Object.keys(watcherPool));
        const db = oneOffDB || FireModel.defaultDb;
        if (!db) {
            const e = new Error(`There is no established way to connect to the database; either set the default DB or pass the DB in as the second parameter to Watch.stop()!`);
            e.name = "FireModel::NoDatabase";
            throw e;
        }
        if (hashCode && !codes.has(hashCode)) {
            const e = new Error(`The hashcode passed into the stop() method [ ${hashCode} ] is not actively being watched!`);
            e.name = "FireModel::Forbidden";
            throw e;
        }
        if (!hashCode) {
            db.unWatch();
            watcherPool = {};
        }
        else {
            const registry = watcherPool[hashCode];
            db.unWatch(registry.eventType === "child"
                ? "value"
                : ["child_added", "child_changed", "child_moved", "child_removed"], registry.dispatch);
            delete watcherPool[hashCode];
        }
    }
    static record(modelClass, recordId, options = {}) {
        const o = new Watch();
        if (o.db) {
            o._db = options.db;
        }
        o._eventType = "value";
        const r = Record.create(modelClass);
        r._initialize({ id: recordId });
        o._query = new SerializedQuery(`${r.dbPath}`);
        o._modelName = r.modelName;
        o._pluralName = r.pluralName;
        o._localPath = r.localPath;
        return o.apiPostQuery(o);
    }
    static list(modelConstructor, options = {}) {
        const o = new Watch();
        if (options.db) {
            o._db = options.db;
        }
        o._eventType = "child";
        const lst = List.create(modelConstructor);
        o._query = new SerializedQuery(lst.dbPath);
        o._modelName = lst.modelName;
        o._pluralName = lst.pluralName;
        o._localPath = lst.localPath;
        return o.apiList(o);
    }
    start() {
        const hash = "w" + String(this._query.hashCode());
        const dispatch = ModelDispatchTransformer({
            watcherHash: hash,
            watcherDbPath: this._query.path,
            watcherLocalPath: this._localPath,
            modelName: this._modelName,
            pluralName: this._pluralName
        })(this._dispatcher || FireModel.dispatch);
        if (this._eventType === "value") {
            this.db.watch(this._query, "value", dispatch);
        }
        else {
            this.db.watch(this._query, ["child_added", "child_changed", "child_moved", "child_removed"], dispatch);
        }
        watcherPool[hash] = {
            eventType: this._eventType,
            dispatch: this._dispatcher,
            query: this._query,
            dbPath: this._query.path,
            createdAt: new Date().getTime()
        };
        return hash;
    }
    dispatch(d) {
        this._dispatcher = d;
        return this.apiStartOnly(this);
    }
    /**
     * since
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
        return this.apiPostQuery(this);
    }
    /**
     * dormantSince
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
        return this.apiPostQuery(this);
    }
    /**
     * after
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
        return this.apiPostQuery(this);
    }
    /**
     * before
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
        return this.apiPostQuery(this);
    }
    /**
     * first
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
        return this.apiPostQuery(this);
    }
    /**
     * last
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
        return this.apiPostQuery(this);
    }
    /**
     * recent
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
        return this.apiPostQuery(this);
    }
    /**
     * inactive
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
        return this.apiPostQuery(this);
    }
    /**
     * fromQuery
     *
     * Watch for all records that conform to a passed in query
     *
     * @param query
     */
    fromQuery(inputQuery) {
        this._query = inputQuery;
        return this.apiPostQuery(this);
    }
    /**
     * all
     *
     * Watch for all records of a given type
     *
     * @param limit it you want to limit the results a max number of records
     */
    all(limit) {
        if (limit) {
            this._query = this._query.limitToLast(limit);
        }
        return this.apiPostQuery(this);
    }
    /**
     * where
     *
     * Watch for all records where a specified property is
     * equal, less-than, or greater-than a certain value
     *
     * @param property the property which the comparison operater is being compared to
     * @param value either just a value (in which case "equality" is the operator), or a tuple with operator followed by value (e.g., [">", 34])
     */
    where(property, value) {
        let operation = "=";
        let val = value;
        if (Array.isArray(value)) {
            val = value[1];
            operation = value[0];
        }
        return this.apiPostQuery(this);
    }
    toString() {
        return `Watching path "${this._query.path}" for "${this._eventType}" event(s) [ hashcode: ${String(this._query.hashCode())} ]`;
    }
    get db() {
        if (!this._db) {
            if (FireModel.defaultDb) {
                this._db = FireModel.defaultDb;
            }
        }
        return this._db;
    }
    apiList(context) {
        return {
            all: this.all.bind(context),
            since: this.since.bind(context),
            first: this.first.bind(context),
            last: this.last.bind(context),
            recent: this.recent.bind(context),
            inactive: this.inactive.bind(context),
            where: this.where.bind(context),
            fromQuery: this.fromQuery.bind(context)
        };
    }
    apiPostQuery(context) {
        return {
            start: this.start.bind(context),
            dispatch: this.dispatch.bind(context)
        };
    }
    apiStartOnly(context) {
        return {
            start: this.start.bind(context)
        };
    }
}
//# sourceMappingURL=Watch.js.map