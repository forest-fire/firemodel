import "reflect-metadata";
import { getRelationships, getProperties, getPushKeys, propertiesByModel, relationshipsByModel } from "./decorator";
import { addModelMeta } from "../ModelMeta";
import { getDbIndexes } from "./indexing";
/** lookup meta data for schema properties */
function getModelProperty(modelKlass) {
    const className = modelKlass.constructor.name;
    return (prop) => ((Object.assign({}, propertiesByModel[className], propertiesByModel.Model) || {})[prop]);
}
function isProperty(modelKlass) {
    return (prop) => {
        const modelProps = getModelProperty(modelKlass)(prop);
        return modelProps ? true : false;
    };
}
function isRelationship(modelKlass) {
    return (prop) => {
        const modelReln = getModelRelationship(modelKlass)(prop);
        return modelReln ? true : false;
    };
}
function getModelRelationship(modelKlass) {
    const className = modelKlass.constructor.name;
    return (prop) => (relationshipsByModel[className] || {})[prop];
}
export function model(options) {
    let isDirty = false;
    function modelDecoration(target) {
        const original = target;
        const childOfBaseModelClass = Object.getPrototypeOf(target).name === "Model";
        const newModel = new target();
        console.log(target, newModel, Object.getPrototypeOf(target).name, options.dbOffset);
        // new constructor
        const f = function (...args) {
            const obj = Reflect.construct(original, args);
            if (options.audit === undefined) {
                options.audit = false;
            }
            if (!(options.audit === true ||
                options.audit === false ||
                options.audit === "server")) {
                console.log(`You set the audit property to "${options.audit}" which is invalid. Valid properties are true, false, and "server". The audit property will be set to false for now.`);
                options.audit = false;
            }
            const meta = Object.assign({}, options, { isProperty: isProperty(obj) }, { property: getModelProperty(obj) }, { properties: getProperties(obj) }, { isRelationship: isRelationship(obj) }, { relationship: getModelRelationship(obj) }, { relationships: getRelationships(obj) }, { dbIndexes: getDbIndexes(obj) }, { pushKeys: getPushKeys(obj) }, { dbOffset: options.dbOffset ? options.dbOffset : "" }, { audit: options.audit ? options.audit : false }, { plural: options.plural }, {
                localPostfix: options.localPostfix === undefined ? "all" : options.localPostfix
            }, { isDirty });
            addModelMeta(obj.constructor.name.toLowerCase(), meta);
            Reflect.defineProperty(obj, "META", {
                get() {
                    return meta;
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
    }
    return modelDecoration;
}
//# sourceMappingURL=schema.js.map