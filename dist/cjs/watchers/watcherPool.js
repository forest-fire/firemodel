"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** a cache of all the watched  */
let watcherPool = {};
function getWatcherPool() {
    return watcherPool;
}
exports.getWatcherPool = getWatcherPool;
function addToWatcherPool(item) {
    watcherPool[item.watcherId] = item;
}
exports.addToWatcherPool = addToWatcherPool;
function clearWatcherPool() {
    watcherPool = {};
}
exports.clearWatcherPool = clearWatcherPool;
function removeFromWatcherPool(code) {
    delete watcherPool[code];
    return watcherPool;
}
exports.removeFromWatcherPool = removeFromWatcherPool;
//# sourceMappingURL=watcherPool.js.map