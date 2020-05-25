"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFksFromPaths = void 0;
const common_types_1 = require("common-types");
function extractFksFromPaths(rec, prop, paths) {
    const pathToModel = rec.dbPath;
    const relnType = rec.META.relationship(prop).relType;
    return paths.reduce((acc, p) => {
        const fkProp = common_types_1.pathJoin(pathToModel, prop);
        if (p.path.includes(fkProp)) {
            const parts = p.path.split("/");
            const fkId = relnType === "hasOne" ? p.value : parts.pop();
            acc = acc.concat(fkId);
        }
        return acc;
    }, []);
}
exports.extractFksFromPaths = extractFksFromPaths;
//# sourceMappingURL=extractFksFromPaths.js.map