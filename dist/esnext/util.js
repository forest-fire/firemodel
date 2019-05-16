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
export function compareHashes(from, to) {
    const results = {
        added: [],
        changed: [],
        removed: []
    };
    const keys = new Set([...Object.keys(from), ...Object.keys(to)]);
    Array.from(keys).forEach(i => {
        if (!to[i]) {
            results.added.push(i);
        }
        else if (!from[i]) {
            results.removed.push(i);
        }
        else if (!equal(from, to)) {
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
export function withoutMeta(model) {
    if (model.META) {
        model = Object.assign({}, model);
        delete model.META;
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