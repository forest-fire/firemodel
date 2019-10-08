import { pathJoin } from "common-types";
export function extractFksFromPaths(rec, prop, paths) {
    const pathToModel = rec.dbPath;
    const relnType = rec.META.relationship(prop).relType;
    return paths.reduce((acc, p) => {
        const fkProp = pathJoin(pathToModel, prop);
        if (p.path.includes(fkProp)) {
            const parts = p.path.split("/");
            const fkId = relnType === "hasOne" ? p.value : parts.pop();
            acc = acc.concat(fkId);
        }
        return acc;
    }, []);
}
//# sourceMappingURL=extractFksFromPaths.js.map