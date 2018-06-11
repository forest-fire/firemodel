//#region generalized structures
/** Enumeration of all Firemodel Actions that will be fired */
export var FMActions;
(function (FMActions) {
    FMActions["RECORD_ADDED"] = "@firemodel/RECORD_ADDED";
    FMActions["RECORD_CHANGED"] = "@firemodel/RECORD_CHANGED";
    FMActions["RECORD_MOVED"] = "@firemodel/RECORD_MOVED";
    FMActions["RECORD_REMOVED"] = "@firemodel/RECORD_REMOVED";
    /** Model has requested listening service */
    FMActions["MODEL_START_LISTENING"] = "@firemodel/MODEL_START_LISTENING";
    /** Model has received initial state from **child_added** events */
    FMActions["MODEL_STATE_READY"] = "@firemodel/MODEL_STATE_READY";
    /**
     * the time at which a _listened to_ model engages with one of it's relationships;
     * the timing of this will be dependant on the meta-data assoc with reln (aka,
     * lazy, reference, etc. )
     */
    FMActions["RELATIONSHIP_ESTABLISHED"] = "@firemodel/RELATIONSHIP_ESTABLISHED";
})(FMActions || (FMActions = {}));
//#endregion
//#region specific events
//#endregion
//# sourceMappingURL=index.js.map