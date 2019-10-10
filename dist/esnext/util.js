import { hashToArray } from "typed-conversions";
import { propertiesByModel } from "./decorators/model-meta/property-store";
import equal from "fast-deep-equal";
export function normalized(...args) {
    return args
        .filter(a => a)
        .map(a => a.replace(/$[\.\/]/, "").replace(/[\.\/]^/, ""))
        .map(a => a.replace(/\./g, "/"));
}
export function slashNotation(...args) {
    return normalized(...args).join("/");
}
export function dotNotation(...args) {
    return normalized(...args)
        .join(".")
        .replace("/", ".");
}
export function updateToAuditChanges(changed, prior) {
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
export function compareHashes(from, to, 
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
        else if (!equal(from[i], to[i])) {
            results.changed.push(i);
        }
    });
    return results;
}
export function getAllPropertiesFromClassStructure(model) {
    const modelName = model.constructor.name;
    const properties = hashToArray(propertiesByModel[modelName], "property") || [];
    let parent = Object.getPrototypeOf(model.constructor);
    while (parent.name) {
        const subClass = new parent();
        const subClassName = subClass.constructor.name;
        properties.push(...hashToArray(propertiesByModel[subClassName], "property"));
        parent = Object.getPrototypeOf(subClass.constructor);
    }
    return properties.map(p => p.property);
}
export function withoutMetaOrPrivate(model) {
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
export function capitalize(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
}
export function lowercase(str) {
    return str.slice(0, 1).toLowerCase() + str.slice(1);
}
export function stripLeadingSlash(str) {
    return str.slice(0, 1) === "/" ? str.slice(1) : str;
}
//# sourceMappingURL=util.js.map