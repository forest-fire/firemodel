"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typed_conversions_1 = require("typed-conversions");
const property_store_1 = require("./decorators/model-meta/property-store");
const fast_deep_equal_1 = __importDefault(require("fast-deep-equal"));
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
function compareHashes(from, to, 
/**
 * optionally explicitly state properties so that relationships
 * can be filtered away
 */
modelProps) {
    const results = {
        added: [],
        changed: [],
        removed: []
    };
    from = from ? from : {};
    to = to ? to : {};
    let keys = Array.from(new Set([
        ...Object.keys(from),
        ...Object.keys(to)
    ]))
        // META should never be part of comparison
        .filter(i => i !== "META")
        // neither should private properties indicated by underscore
        .filter(i => i.slice(0, 1) !== "_");
    if (modelProps) {
        keys = keys.filter(i => modelProps.includes(i));
    }
    keys.forEach(i => {
        if (!to[i]) {
            results.added.push(i);
        }
        else if (from[i] === null) {
            results.removed.push(i);
        }
        else if (!fast_deep_equal_1.default(from[i], to[i])) {
            results.changed.push(i);
        }
    });
    return results;
}
exports.compareHashes = compareHashes;
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
function withoutMetaOrPrivate(model) {
    if (model && model.META) {
        model = Object.assign({}, model);
        delete model.META;
    }
    if (model) {
        Object.keys((key) => {
            if (key.slice(0, 1) === "_") {
                delete model[key];
            }
        });
    }
    return model;
}
exports.withoutMetaOrPrivate = withoutMetaOrPrivate;
function capitalize(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
}
exports.capitalize = capitalize;
function lowercase(str) {
    return str.slice(0, 1).toLowerCase() + str.slice(1);
}
exports.lowercase = lowercase;
function stripLeadingSlash(str) {
    return str.slice(0, 1) === "/" ? str.slice(1) : str;
}
exports.stripLeadingSlash = stripLeadingSlash;
//# sourceMappingURL=util.js.map