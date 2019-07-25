"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Watch_1 = require("../Watch");
const typed_conversions_1 = require("typed-conversions");
/**
 * **findWatchers**
 *
 * Given a database path, finds all the watchers which are watching this
 * path or a parent of this path.
 */
function findWatchers(dbPath) {
    return typed_conversions_1.hashToArray(Watch_1.Watch.inventory).filter(i => Array.isArray(i.query)
        ? /** handles the "list-of-records" use case */
            i.query.map(p => p.path).includes(dbPath)
        : /** handles the standard use case */
            dbPath.includes(i.query.path));
}
exports.findWatchers = findWatchers;
//# sourceMappingURL=findWatchers.js.map