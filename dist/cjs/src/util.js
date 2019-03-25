"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=util.js.map