import "reflect-metadata";
import { getRelationships, getProperties, getPushKeys } from "./decorator";
function propertyMeta(context) {
    return (prop) => Reflect.getMetadata(prop, context);
}
export function schema(options) {
    return (target) => {
        const original = target;
        const f = function (...args) {
            const meta = options;
            const obj = Reflect.construct(original, args);
            Reflect.defineProperty(obj, "META", {
                get() {
                    return Object.assign({}, options, { property: propertyMeta(obj) }, { properties: getProperties(obj) }, { relationships: getRelationships(obj) }, { pushKeys: getPushKeys(obj) }, { audit: options.audit ? options.audit : false });
                },
                set() {
                    throw new Error("The meta property can only be set with the @schema decorator!");
                },
                configurable: false,
                enumerable: false
            });
            return obj;
        };
        f.prototype = original.prototype;
        return f;
    };
}
