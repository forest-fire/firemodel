"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function cleanPredecessor(db, predecessors) {
    let empty = false;
    let index = 1;
    while (!empty || index > predecessors.length) {
        const path = predecessors.slice(0, index).join("/");
        const result = await db.getValue(path);
        if (!result || Object.keys(result).length === 0) {
            await db.remove(path);
            empty = true;
        }
        index++;
    }
}
exports.default = cleanPredecessor;
//# sourceMappingURL=cleanPredecessor.js.map