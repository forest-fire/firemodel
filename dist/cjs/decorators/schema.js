"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const decorator_1 = require("./decorator");
const ModelMeta_1 = require("../ModelMeta");
const indexing_1 = require("./indexing");
/** lookup meta data for schema properties */
function getModelProperty(modelKlass) {
    const className = modelKlass.constructor.name;
    return (prop) => ((Object.assign({}, decorator_1.propertiesByModel[className], decorator_1.propertiesByModel.Model) || {})[prop]);
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
    return (prop) => (decorator_1.relationshipsByModel[className] || {})[prop];
}
function model(options) {
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
            const meta = Object.assign({}, options, { isProperty: isProperty(obj) }, { property: getModelProperty(obj) }, { properties: decorator_1.getProperties(obj) }, { isRelationship: isRelationship(obj) }, { relationship: getModelRelationship(obj) }, { relationships: decorator_1.getRelationships(obj) }, { dbIndexes: indexing_1.getDbIndexes(obj) }, { pushKeys: decorator_1.getPushKeys(obj) }, { dbOffset: options.dbOffset ? options.dbOffset : "" }, { audit: options.audit ? options.audit : false }, { plural: options.plural }, {
                localPostfix: options.localPostfix === undefined ? "all" : options.localPostfix
            }, { isDirty });
            ModelMeta_1.addModelMeta(obj.constructor.name.toLowerCase(), meta);
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
    };
}
exports.model = model;
//# sourceMappingURL=schema.js.map