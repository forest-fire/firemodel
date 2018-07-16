"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function promoteStringToFMEvents(k) {
    return k;
}
/** Enumeration of all Firemodel Actions that will be fired */
var FMEvents;
(function (FMEvents) {
    /** a list of records has been queried from DB and being dispatched to FE State Mgmt */
    FMEvents["RECORD_LIST"] = "@firemodel/RECORD_LIST";
    /** A record has been added locally */
    FMEvents["RECORD_ADDED_LOCALLY"] = "@firemodel/RECORD_ADDED_LOCALLY";
    /** A record has been added to a given Model list being watched */
    FMEvents["RECORD_ADDED"] = "@firemodel/RECORD_ADDED";
    /** A record has been updated locally */
    FMEvents["RECORD_CHANGED_LOCALLY"] = "@firemodel/RECORD_CHANGED_LOCALLY";
    /** A record has been updated on Firebase */
    FMEvents["RECORD_CHANGED"] = "@firemodel/RECORD_CHANGED";
    /** for client originated events touching relationships (as external events would come back as an event per model) */
    FMEvents["RECORD_MOVED"] = "@firemodel/RECORD_MOVED";
    /** A record has been removed from a given Model list being watched */
    FMEvents["RECORD_REMOVED_LOCALLY"] = "@firemodel/RECORD_REMOVED_LOCALLY";
    /** A record has been removed from a given Model list being watched */
    FMEvents["RECORD_REMOVED"] = "@firemodel/RECORD_REMOVED";
    /** Indicates that a given model's "since" property has been updated */
    FMEvents["SINCE_UPDATED"] = "@firemodel/SINCE_UPDATED";
    /** Watcher has established connection with Firebase */
    FMEvents["WATCHER_STARTED"] = "@firemodel/WATCHER_STARTED";
    /** Watcher has disconnected an event stream from Firebase */
    FMEvents["WATCHER_STOPPED"] = "@firemodel/WATCHER_STOPPED";
    /** Watcher has disconnected all event streams from Firebase */
    FMEvents["WATCHER_STOPPED_ALL"] = "@firemodel/WATCHER_STOPPED_ALL";
    /** Relationship(s) have removed */
    FMEvents["RELATIONSHIP_REMOVED"] = "@firemodel/RELATIONSHIP_REMOVED";
    /** Relationship(s) have been removed locally */
    FMEvents["RELATIONSHIP_REMOVED_LOCALLY"] = "@firemodel/RELATIONSHIP_REMOVED_LOCALLY";
    /** Relationship(s) have added */
    FMEvents["RELATIONSHIP_ADDED"] = "@firemodel/RELATIONSHIP_ADDED";
    /** Relationship(s) have been added locally */
    FMEvents["RELATIONSHIP_ADDED_LOCALLY"] = "@firemodel/RELATIONSHIP_ADDED_LOCALLY";
    FMEvents["APP_CONNECTED"] = "@firemodel/APP_CONNECTED";
    FMEvents["APP_DISCONNECTED"] = "@firemodel/APP_DISCONNECTED";
})(FMEvents = exports.FMEvents || (exports.FMEvents = {}));
//#endregion
//#region specific events
//#endregion
//# sourceMappingURL=index.js.map