import { Record } from "./Record";
function construct(target, ...args) {
    //
}
export class ListProxy extends Array {
    constructor(items) {
        super(...items);
    }
    static create(modelConstructor, items) {
        const record = Record.create(modelConstructor);
        const get = (target, prop, value, receiver) => {
            //
        };
        // const arr = new Proxy<ListProxy<T>>(new ListProxy<T>(items), {});
        const arr = new ListProxy(items);
        arr.__record__ = record;
        return arr;
    }
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
        return this.__record__ ? this.__record__.META.properties : [];
    }
    get relationships() {
        return this.__record__ ? this.__record__.META.relationships : [];
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
//# sourceMappingURL=ListProxy.js.map