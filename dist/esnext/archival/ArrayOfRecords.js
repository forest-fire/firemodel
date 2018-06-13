export class ArrayOfRecords extends Array {
    get modelName() {
        return this.__record__ ? this.__record__.modelName : "unknown";
    }
    get pluralName() {
        return this.__record__ ? this.__record__.pluralName : "unknown";
    }
    get pushKeys() {
        return this.__record__ ? this.__record__.META.pushKeys : {};
    }
    get properties() {
        return this.__record__ ? this.__record__.META.properties : {};
    }
    get relationships() {
        return this.__record__ ? this.__record__.META.relationships : {};
    }
    get dbOffset() {
        return this.__record__
            ? this.__record__.META.dbOffset
            : "not applicable";
    }
    get isAudited() {
        return this.__record__
            ? this.__record__.META.audit
                ? true
                : false
            : false;
    }
    property(prop) {
        if (!this.__record__) {
            const e = new Error(`You can't check for meta properties of a non-Model!`);
            e.name = "FireModel::Forbidden";
            throw e;
        }
        return this.__record__.META.property(prop);
    }
}
//# sourceMappingURL=ArrayOfRecords.js.map