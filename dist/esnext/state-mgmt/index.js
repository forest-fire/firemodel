function promoteStringToFMEvents(k) {
    return k;
}
/** Enumeration of all Firemodel Actions that will be fired */
export var FmEvents;
(function (FmEvents) {
    /** a list of records has been queried from DB and being dispatched to FE State Mgmt */
    FmEvents["RECORD_LIST"] = "@firemodel/RECORD_LIST";
    /** a list of records was SET to a new list of records */
    FmEvents["LIST_SET"] = "@firemodel/LIST_SET";
    /** a list of records removed */
    FmEvents["LIST_CLEAR"] = "@firemodel/LIST_CLEAR";
    /** A record has been added locally */
    FmEvents["RECORD_ADDED_LOCALLY"] = "@firemodel/RECORD_ADDED_LOCALLY";
    /** A record which was added locally has now been confirmed by Firebase */
    FmEvents["RECORD_ADDED_CONFIRMATION"] = "@firemodel/RECORD_ADDED_CONFIRMATION";
    /** A record added locally failed to be saved to Firebase */
    FmEvents["RECORD_ADDED_ROLLBACK"] = "@firemodel/RECORD_ADDED_ROLLBACK";
    /** A record has been added to a given Model list being watched (external event) */
    FmEvents["RECORD_ADDED"] = "@firemodel/RECORD_ADDED";
    /** A record has been updated locally */
    FmEvents["RECORD_CHANGED_LOCALLY"] = "@firemodel/RECORD_CHANGED_LOCALLY";
    /** a record changed locally has now been confirmed by Firebase */
    FmEvents["RECORD_CHANGED_CONFIRMATION"] = "@firemodel/RECORD_CHANGED_CONFIRMATION";
    /** A record changed locally failed to be saved to Firebase */
    FmEvents["RECORD_CHANGED_ROLLBACK"] = "@firemodel/RECORD_CHANGED_ROLLBACK";
    /** A record has been updated on Firebase (external event) */
    FmEvents["RECORD_CHANGED"] = "@firemodel/RECORD_CHANGED";
    /**
     * for client originated events touching relationships (as external events would come back as an event per model)
     */
    FmEvents["RECORD_MOVED"] = "@firemodel/RECORD_MOVED";
    /** A record has been removed from a given Model list being watched */
    FmEvents["RECORD_REMOVED_LOCALLY"] = "@firemodel/RECORD_REMOVED_LOCALLY";
    /** a record removed locally has now been confirmed by Firebase */
    FmEvents["RECORD_REMOVED_CONFIRMATION"] = "@firemodel/RECORD_REMOVED_CONFIRMATION";
    /** A record removed locally failed to be saved to Firebase */
    FmEvents["RECORD_REMOVED_ROLLBACK"] = "@firemodel/RECORD_REMOVED_LOCALLY";
    /** A record has been removed from a given Model list being watched */
    FmEvents["RECORD_REMOVED"] = "@firemodel/RECORD_REMOVED";
    /** An attempt to access the database was refused to lack of permissions */
    FmEvents["PERMISSION_DENIED"] = "@firemodel/PERMISSION_DENIED";
    /** The optimistic local change now needs to be rolled back due to failure in Firebase */
    FmEvents["RECORD_LOCAL_ROLLBACK"] = "@firemodel/RECORD_LOCAL_ROLLBACK";
    /** Indicates that a given model's "since" property has been updated */
    FmEvents["SINCE_UPDATED"] = "@firemodel/SINCE_UPDATED";
    /** Watcher has started request to watch; waiting for initial SYNC event */
    FmEvents["WATCHER_STARTING"] = "@firemodel/WATCHER_STARTING";
    /** Watcher has established connection with Firebase */
    FmEvents["WATCHER_STARTED"] = "@firemodel/WATCHER_STARTED";
    /** Watcher failed to start */
    FmEvents["WATCHER_FAILED"] = "@firemodel/WATCHER_FAILED";
    /** Watcher has disconnected an event stream from Firebase */
    FmEvents["WATCHER_STOPPED"] = "@firemodel/WATCHER_STOPPED";
    /** Watcher has disconnected all event streams from Firebase */
    FmEvents["WATCHER_STOPPED_ALL"] = "@firemodel/WATCHER_STOPPED_ALL";
    /** Relationship(s) have been removed locally */
    FmEvents["RELATIONSHIP_REMOVED_LOCALLY"] = "@firemodel/RELATIONSHIP_REMOVED_LOCALLY";
    /** Relationship removal has been confirmed by database */
    FmEvents["RELATIONSHIP_REMOVED_CONFIRMATION"] = "@firemodel/RELATIONSHIP_REMOVED_CONFIRMATION";
    /** Relationship removal failed and must be rolled back if client updated optimistically */
    FmEvents["RELATIONSHIP_REMOVED_ROLLBACK"] = "@firemodel/RELATIONSHIP_REMOVED_CONFIRMATION";
    /** Relationship has been added locally */
    FmEvents["RELATIONSHIP_ADDED_LOCALLY"] = "@firemodel/RELATIONSHIP_ADDED_LOCALLY";
    /** Relationship add has been confirmed by database */
    FmEvents["RELATIONSHIP_ADDED_CONFIRMATION"] = "@firemodel/RELATIONSHIP_ADDED_CONFIRMATION";
    /** Relationship add failed and must be rolled back if client updated optimistically */
    FmEvents["RELATIONSHIP_ADDED_ROLLBACK"] = "@firemodel/RELATIONSHIP_ADDED_ROLLBACK";
    /** Relationship has been set locally (relating to a hasOne event) */
    FmEvents["RELATIONSHIP_SET_LOCALLY"] = "@firemodel/RELATIONSHIP_SET_LOCALLY";
    /** Relationship set has been confirmed by database */
    FmEvents["RELATIONSHIP_SET_CONFIRMATION"] = "@firemodel/RELATIONSHIP_SET_CONFIRMATION";
    /** Relationship set failed and must be rolled back if client updated optimistically */
    FmEvents["RELATIONSHIP_SET_ROLLBACK"] = "@firemodel/RELATIONSHIP_ADDED_ROLLBACK";
    /** A relationship was "added" but it already existed; this is typically non-action oriented */
    FmEvents["RELATIONSHIP_DUPLICATE_ADD"] = "@firemodel/RELATIONSHIP_ADDED_ROLLBACK";
    FmEvents["APP_CONNECTED"] = "@firemodel/APP_CONNECTED";
    FmEvents["APP_DISCONNECTED"] = "@firemodel/APP_DISCONNECTED";
    FmEvents["ERROR_UNKNOWN_EVENT"] = "@firemodel/UNKNOWN_EVENT";
    FmEvents["ERROR_OTHER"] = "@firemodel/OTHER_ERROR";
})(FmEvents || (FmEvents = {}));
//#endregion
//#region specific events
//#endregion
//# sourceMappingURL=index.js.map