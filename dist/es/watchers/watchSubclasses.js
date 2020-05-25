"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWatchRecord = exports.getWatchList = void 0;
const private_1 = require("@/private");
/**
 * allows the parent `Watch` class to instantiate
 * subclasses without having a circular dependency
 */
function getWatchList() {
    return new private_1.WatchList();
}
exports.getWatchList = getWatchList;
/**
 * allows the parent `Watch` class to instantiate
 * subclasses without having a circular dependency
 */
function getWatchRecord() {
    return new private_1.WatchRecord();
}
exports.getWatchRecord = getWatchRecord;
//# sourceMappingURL=watchSubclasses.js.map