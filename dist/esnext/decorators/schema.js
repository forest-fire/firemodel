import "reflect-metadata";
import { getRelationships, getProperties, getPushKeys } from "./decorator";
import { addModelMeta } from "../ModelMeta";
/** lookup meta data for schema properties */
function getModelProperty(modelKlass) {
    return (prop) => Reflect.getMetadata(prop, modelKlass);
}
function getModelRelationship(relationships) {
    return (relnProp) => relationships.find(i => relnProp === i.property);
}
export function model(options) {
    let isDirty = false;
    return (target) => {
        const original = target;
        // new constructor
        const f = function (...args) {
            const obj = Reflect.construct(original, args);
            if (options.audit === undefined) {
                options.audit = false;
            }
            if (!(options.audit === true ||
                options.audit === false ||
                options.audit === "server")) {
                console.warn(`You set the audit property to "${options.audit}" which is invalid. Valid properties are true, false, and "server". The audit property will be set to false for now.`);
                options.audit = false;
            }
            const payload = Object.assign({}, options, { property: getModelProperty(obj) }, { properties: getProperties(obj) }, { relationship: getModelRelationship(getRelationships(obj)) }, { relationships: getRelationships(obj) }, { pushKeys: getPushKeys(obj) }, { dbOffset: options.dbOffset ? options.dbOffset : "" }, { audit: options.audit ? options.audit : false }, { isDirty });
            addModelMeta(obj.constructor.name.toLowerCase(), payload);
            Reflect.defineProperty(obj, "META", {
                get() {
                    return payload;
                },
                set(prop) {
                    if (typeof prop === "object" && prop.isDirty !== undefined) {
                        isDirty = prop.isDirty;
                    }
                    else {
                        throw new Error("The META properties should only be set with the @model decorator at design time!");
                    }
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