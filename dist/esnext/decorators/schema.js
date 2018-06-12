import "reflect-metadata";
import { getRelationships, getProperties, getPushKeys } from "./decorator";
/** lookup meta data for schema properties */
function propertyMeta(context) {
    return (prop) => Reflect.getMetadata(prop, context);
}
export function model(options) {
    return (target) => {
        const original = target;
        // new constructor
        const f = function (...args) {
            const meta = options;
            const obj = Reflect.construct(original, args);
            Reflect.defineProperty(obj, "META", {
                get() {
                    return Object.assign({}, options, { property: propertyMeta(obj) }, { properties: getProperties(obj) }, { relationships: getRelationships(obj) }, { pushKeys: getPushKeys(obj) }, { audit: options.audit ? options.audit : false });
                },
                set() {
                    throw new Error("The meta property can only be set with the @model decorator!");
                },
                configurable: false,
                enumerable: false
            });
            return obj;
        };
        // copy prototype so intanceof operator still works
        f.prototype = original.prototype;
        // return new constructor (will override original)
        return f;
    };
}
//# sourceMappingURL=schema.js.map