"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWatchRecord = exports.getWatchList = void 0;
const WatchList_1 = require("./WatchList");
const WatchRecord_1 = require("./WatchRecord");
/**
 * allows the parent `Watch` class to instantiate
 * subclasses without having a circular dependency
 */
function getWatchList() {
    return new WatchList_1.WatchList();
}
exports.getWatchList = getWatchList;
/**
 * allows the parent `Watch` class to instantiate
 * subclasses without having a circular dependency
 */
function getWatchRecord() {
    return new WatchRecord_1.WatchRecord();
}
exports.getWatchRecord = getWatchRecord;
//# sourceMappingURL=watchSubclasses.js.map