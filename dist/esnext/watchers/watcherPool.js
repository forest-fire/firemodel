/** a cache of all the watched  */
let watcherPool = {};
export function getWatcherPool() {
    return watcherPool;
}
export function addToWatcherPool(item) {
    watcherPool[item.watcherId] = item;
}
export function clearWatcherPool() {
    watcherPool = {};
}
export function removeFromWatcherPool(code) {
    delete watcherPool[code];
    return watcherPool;
}
//# sourceMappingURL=watcherPool.js.map