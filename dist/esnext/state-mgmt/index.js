//#region generalized structures
/** Enumeration of all Firemodel Actions that will be fired */
export var FMEvents;
(function (FMEvents) {
    /** A record has been added to a given Model list being watched */
    FMEvents["RECORD_ADDED"] = "@firemodel/RECORD_ADDED";
    FMEvents["RECORD_CHANGED"] = "@firemodel/RECORD_CHANGED";
    /** for client originated events touching relationships (as external events would come back as an event per model) */
    FMEvents["RECORD_MOVED"] = "@firemodel/RECORD_MOVED";
    /** A record has been removed from a given Model list being watched */
    FMEvents["RECORD_REMOVED"] = "@firemodel/RECORD_REMOVED";
    /** Watcher has established connection with Firebase */
    FMEvents["WATCHER_STARTED"] = "@firemodel/WATCHER_STARTED";
    /** Watcher has disconnected an event stream from Firebase */
    FMEvents["WATCHER_STOPPED"] = "@firemodel/WATCHER_STOPPED";
    /** Watcher has disconnected all event streams from Firebase */
    FMEvents["WATCHER_STOPPED_ALL"] = "@firemodel/WATCHER_STOPPED_ALL";
    /** A Record has added a relationship to another */
    FMEvents["RELATIONSHIP_ADDED"] = "@firemodel/RELATIONSHIP_ADDED";
    /** A Record has removed a relationship from another */
    FMEvents["RELATIONSHIP_REMOVED"] = "@firemodel/RELATIONSHIP_REMOVED";
    FMEvents["APP_CONNECTED"] = "@firemodel/APP_CONNECTED";
    FMEvents["APP_DISCONNECTED"] = "@firemodel/APP_DISCONNECTED";
})(FMEvents || (FMEvents = {}));
//#endregion
//#region specific events
//#endregion
//# sourceMappingURL=index.js.map