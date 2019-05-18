"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Record_1 = require("../Record");
const __1 = require("..");
const ModelMeta_1 = require("../ModelMeta");
const UnknownRelationshipProblem_1 = require("../errors/relationships/UnknownRelationshipProblem");
const extractFksFromPaths_1 = require("./extractFksFromPaths");
const locallyUpdateFkOnRecord_1 = require("./locallyUpdateFkOnRecord");
const sendRelnDispatchEvent_1 = require("./relationships/sendRelnDispatchEvent");
/**
 * **relationshipOperation**
 *
 * updates the current Record while also executing the appropriate two-phased commit
 * with the `dispatch()` function; looking to associate with watchers where ever possible
 */
async function relationshipOperation(rec, 
/**
 * **operation**
 *
 * The relationship operation that is being executed
 */
operation, 
/**
 * **property**
 *
 * The property on this model which changing its relationship status in some way
 */
property, 
/**
 * **paths**
 *
 * a set of name value pairs where the `name` is the DB path that needs updating
 * and the value is the value to set.
 */
paths, options = {}) {
    const dispatchEvents = {
        set: [
            __1.FMEvents.RELATIONSHIP_SET_LOCALLY,
            __1.FMEvents.RELATIONSHIP_SET_CONFIRMATION,
            __1.FMEvents.RELATIONSHIP_SET_ROLLBACK
        ],
        clear: [
            __1.FMEvents.RELATIONSHIP_REMOVED_LOCALLY,
            __1.FMEvents.RELATIONSHIP_REMOVED_CONFIRMATION,
            __1.FMEvents.RELATIONSHIP_REMOVED_ROLLBACK
        ],
        // update: [
        //   FMEvents.RELATIONSHIP_UPDATED_LOCALLY,
        //   FMEvents.RELATIONSHIP_UPDATED_CONFIRMATION,
        //   FMEvents.RELATIONSHIP_UPDATED_ROLLBACK
        // ],
        add: [
            __1.FMEvents.RELATIONSHIP_ADDED_LOCALLY,
            __1.FMEvents.RELATIONSHIP_ADDED_CONFIRMATION,
            __1.FMEvents.RELATIONSHIP_ADDED_ROLLBACK
        ],
        remove: [
            __1.FMEvents.RELATIONSHIP_REMOVED_LOCALLY,
            __1.FMEvents.RELATIONSHIP_REMOVED_CONFIRMATION,
            __1.FMEvents.RELATIONSHIP_REMOVED_ROLLBACK
        ]
    };
    try {
        const [localEvent, confirmEvent, rollbackEvent] = dispatchEvents[operation];
        const fkRecord = Record_1.Record.create(rec.META.relationship(property).fkConstructor());
        const fkMeta = ModelMeta_1.getModelMeta(fkRecord.data);
        const transactionId = "t-reln-" +
            Math.random()
                .toString(36)
                .substr(2, 5) +
            "-" +
            Math.random()
                .toString(36)
                .substr(2, 5);
        try {
            await localRelnOp(rec, operation, property, paths, localEvent, transactionId);
        }
        catch (e) {
            await relnRollback(rec, operation, property, paths, rollbackEvent, transactionId, e);
        }
        await relnConfirmation(rec, operation, property, paths, confirmEvent, transactionId);
    }
    catch (e) {
        if (e.firemodel) {
            throw e;
        }
        else {
            throw new UnknownRelationshipProblem_1.UnknownRelationshipProblem(e, rec, property, operation);
        }
    }
}
exports.relationshipOperation = relationshipOperation;
async function localRelnOp(rec, op, prop, paths, event, transactionId) {
    // locally modify Record's values
    const ids = extractFksFromPaths_1.extractFksFromPaths(rec, prop, paths);
    ids.map(id => {
        locallyUpdateFkOnRecord_1.locallyUpdateFkOnRecord(rec, op, prop, id);
    });
    // TODO: investigate why multiPathSet wasn't working
    // build MPS
    // const dbPaths = discoverRootPath(paths);
    // const mps = rec.db.multiPathSet(dbPaths.root || "/");
    // dbPaths.paths.map(p => mps.add({ path: p.path, value: p.value }));
    const fkRecord = Record_1.Record.create(rec.META.relationship(prop).fkConstructor());
    // execute MPS on DB
    try {
        sendRelnDispatchEvent_1.sendRelnDispatchEvent(event, transactionId, op, rec, prop, paths);
        // await mps.execute();
        await rec.db.ref("/").update(paths.reduce((acc, curr) => {
            acc[curr.path] = curr.value;
            return acc;
        }, {}));
    }
    catch (e) {
        // TODO: complete err handling
        throw e;
    }
}
exports.localRelnOp = localRelnOp;
async function relnConfirmation(rec, op, prop, paths, event, transactionId) {
    sendRelnDispatchEvent_1.sendRelnDispatchEvent(event, transactionId, op, rec, prop, paths);
}
exports.relnConfirmation = relnConfirmation;
async function relnRollback(rec, op, prop, paths, event, transactionId, err) {
    sendRelnDispatchEvent_1.sendRelnDispatchEvent(event, transactionId, op, rec, prop, paths, err);
}
exports.relnRollback = relnRollback;
//# sourceMappingURL=relationshipOperation.js.map