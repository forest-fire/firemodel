"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Watch_1 = require("../Watch");
const typed_conversions_1 = require("typed-conversions");
/**
 * **findWatchers**
 *
 * Given a database path, finds all the watchers which are watching this
 * path or a parent of this path. This must consider a normal **list** or
 * **record** watcher but also a **list-of-records** where instead of a
 * `1:1` relationship between "watcher" and Firebase listener there is instead
 * a `1:M` relationship.
 */
function findWatchers(
/** the database path where change was detected */
dbPath) {
    const inspectListofRecords = (watcher) => {
        const paths = watcher.watcherPaths;
        let found = false;
        paths.forEach(p => {
            if (dbPath.includes(p)) {
                found = true;
            }
        });
        return found;
    };
    return typed_conversions_1.hashToArray(Watch_1.Watch.inventory).filter(i => i.watcherSource === "list-of-records"
        ? /** handles the "list-of-records" use case */
            inspectListofRecords(i)
        : /** handles the standard use case */
            dbPath.includes(i.query.path));
}
exports.findWatchers = findWatchers;
//# sourceMappingURL=findWatchers.js.map