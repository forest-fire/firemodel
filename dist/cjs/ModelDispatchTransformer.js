"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_mgmt_1 = require("./state-mgmt");
// TODO: This looks ugly, find time to refactor
/**
 * Contextualizes dispatches from abstracted-firebase into Model aware messages
 */
exports.ModelDispatchTransformer = (fireModelContext) => (clientHandler) => {
    if (typeof clientHandler !== "function") {
        const e = new Error(`A watcher is being setup but the dispatch function is not valid or not set!`);
        e.name = "FireModel::NotAllowed";
        throw e;
    }
    return (event) => {
        if (event.eventType === "value") {
            fireModelContext.type =
                event.value === null
                    ? state_mgmt_1.FMEvents.RECORD_REMOVED
                    : state_mgmt_1.FMEvents.RECORD_CHANGED;
            fireModelContext.dbPath = `${fireModelContext.watcherDbPath}`;
            fireModelContext.localPath = `${fireModelContext.watcherLocalPath}`;
        }
        else {
            fireModelContext.dbPath = `${fireModelContext.watcherDbPath}/${event.key}`;
            fireModelContext.localPath = `${fireModelContext.watcherLocalPath}/${event.key}`;
            const typeLookup = {
                child_added: state_mgmt_1.FMEvents.RECORD_ADDED,
                child_removed: state_mgmt_1.FMEvents.RECORD_REMOVED,
                child_changed: state_mgmt_1.FMEvents.RECORD_CHANGED,
                child_moved: state_mgmt_1.FMEvents.RECORD_MOVED
            };
            fireModelContext.type =
                typeLookup[event.eventType];
        }
        const e = Object.assign({}, event, fireModelContext);
        delete e.watcherDbPath;
        delete e.watcherLocalPath;
        return clientHandler(e);
    };
};
//# sourceMappingURL=ModelDispatchTransformer.js.map