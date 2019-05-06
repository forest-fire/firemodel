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
    return typed_conversions_1.hashToArray(Watch_1.Watch.inventory).filter(i => dbPath.includes(i.query.path));
}
exports.findWatchers = findWatchers;
//# sourceMappingURL=findWatchers.js.map