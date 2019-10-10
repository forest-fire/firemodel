/** a cache of all the watched  */
let watcherPool = {};
export function getWatcherPool() {
    return watcherPool;
}
export function addToWatcherPool(item) {
    watcherPool[item.watcherId] = item;
}
export function getFromWatcherPool(code) {
    return watcherPool[code];
}
export function clearWatcherPool() {
    watcherPool = {};
}
/**
 * Each watcher must have it's own `dispatch()` function which
 * is reponsible for capturing the "context". This will be used
 * both by locally originated events (which have more info) and
 * server based events.
 */
export function addDispatchForWatcher(code, dispatch) {
    //
}
export function removeFromWatcherPool(code) {
    delete watcherPool[code];
    return watcherPool;
}
//# sourceMappingURL=watcherPool.js.map