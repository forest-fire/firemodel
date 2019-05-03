import { hashToArray } from "typed-conversions";
import { propertiesByModel } from "./decorators/model-meta/property-store";
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
//# sourceMappingURL=util.js.map