"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typed_conversions_1 = require("typed-conversions");
const property_store_1 = require("./decorators/model-meta/property-store");
function normalized(...args) {
    return args
        .filter(a => a)
        .map(a => a.replace(/$[\.\/]/, "").replace(/[\.\/]^/, ""))
        .map(a => a.replace(/\./g, "/"));
}
exports.normalized = normalized;
function slashNotation(...args) {
    return normalized(...args).join("/");
}
exports.slashNotation = slashNotation;
function dotNotation(...args) {
    return normalized(...args)
        .join(".")
        .replace("/", ".");
}
exports.dotNotation = dotNotation;
function updateToAuditChanges(changed, prior) {
    return Object.keys(changed).reduce((prev, curr) => {
        const after = changed[curr];
        const before = prior[curr];
        const propertyAction = !before ? "added" : !after ? "removed" : "updated";
        const payload = {
            before,
            after,
            property: curr,
            action: propertyAction
        };
        prev.push(payload);
        return prev;
    }, []);
}
exports.updateToAuditChanges = updateToAuditChanges;
function getAllPropertiesFromClassStructure(model) {
    const modelName = model.constructor.name;
    const properties = typed_conversions_1.hashToArray(property_store_1.propertiesByModel[modelName], "property") || [];
    let parent = Object.getPrototypeOf(model.constructor);
    while (parent.name) {
        const subClass = new parent();
        const subClassName = subClass.constructor.name;
        properties.push(...typed_conversions_1.hashToArray(property_store_1.propertiesByModel[subClassName], "property"));
        parent = Object.getPrototypeOf(subClass.constructor);
    }
    return properties.map(p => p.property);
}
exports.getAllPropertiesFromClassStructure = getAllPropertiesFromClassStructure;
//# sourceMappingURL=util.js.map