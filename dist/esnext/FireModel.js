// tslint:disable-next-line:no-var-requires
const pluralize = require("pluralize");
export class FireModel {
    static get defaultDb() {
        return FireModel._defaultDb;
    }
    static set defaultDb(db) {
        this._defaultDb = db;
    }
    //#endregion
    //#region PUBLIC INTERFACE
    get modelName() {
        return this._model.constructor.name.toLowerCase();
    }
    get pluralName() {
        // TODO: add back the exception processing
        return pluralize(this.modelName);
    }
    get META() {
        return this._model.META;
    }
    get properties() {
        return this._model.META.properties;
    }
    get relationships() {
        return this._model.META.relationships;
    }
    /** the connected real-time database */
    get db() {
        if (!this._db) {
            this._db = FireModel.defaultDb;
        }
        if (!this._db) {
            const e = new Error(`Can't get DB as it has not been set yet for this instance and no default database exists [ ${this.modelName} ]!`);
            e.name = "FireModel::NoDatabase";
            throw e;
        }
        return this._db;
    }
    get pushKeys() {
        return this._model.META.pushKeys;
    }
}
//#region STATIC INTERFACE
FireModel._defaultDb = null;
//# sourceMappingURL=FireModel.js.map