"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.model = void 0;
require("reflect-metadata");
const private_1 = require("@/private");
function model(options = {}) {
    let isDirty = false;
    return function decorateModel(target) {
        // Function to add META to the model
        function addMetaProperty() {
            const modelOfObject = new target();
            if (options.audit === undefined) {
                options.audit = false;
            }
            if (!(options.audit === true ||
                options.audit === false ||
                options.audit === "server")) {
                console.log(`You set the audit property to "${options.audit}" which is invalid. Valid properties are true, false, and "server". The audit property will be set to false for now.`);
                options.audit = false;
            }
            const meta = {
                ...options,
                ...{ isProperty: private_1.isProperty(modelOfObject) },
                ...{ property: private_1.getModelProperty(modelOfObject) },
                ...{ properties: private_1.getProperties(modelOfObject) },
                ...{ isRelationship: private_1.isRelationship(modelOfObject) },
                ...{ relationship: private_1.getModelRelationship(modelOfObject) },
                ...{ relationships: private_1.getRelationships(modelOfObject) },
                ...{ dbIndexes: private_1.getDbIndexes(modelOfObject) },
                ...{ pushKeys: private_1.getPushKeys(modelOfObject) },
                ...{ dbOffset: options.dbOffset ? options.dbOffset : "" },
                ...{ audit: options.audit ? options.audit : false },
                ...{ plural: options.plural },
                ...{
                    allProperties: [
                        ...private_1.getProperties(modelOfObject).map((p) => p.property),
                        ...private_1.getRelationships(modelOfObject).map((p) => p.property),
                    ],
                },
                ...{
                    localPostfix: options.localPostfix === undefined ? "all" : options.localPostfix,
                },
                ...{
                    localModelName: options.localModelName === undefined
                        ? modelOfObject.constructor.name.slice(0, 1).toLowerCase() +
                            modelOfObject.constructor.name.slice(1)
                        : options.localModelName,
                },
                ...{ isDirty },
            };
            private_1.addModelMeta(target.constructor.name.toLowerCase(), meta);
            Object.defineProperty(target.prototype, "META", {
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
                enumerable: false,
            });
            if (target) {
                // register the constructor so name based lookups will succeed
                private_1.modelRegister(target);
            }
            return target;
        }
        // copy prototype so intanceof operator still works
        addMetaProperty.prototype = target.prototype;
        // return new constructor (will override original)
        return addMetaProperty();
    };
}
exports.model = model;
//# sourceMappingURL=model.js.map