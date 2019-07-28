import { Record } from "../Record";
import { FmEvents } from "..";
import { getModelMeta } from "../ModelMeta";
import { UnknownRelationshipProblem } from "../errors/relationships/UnknownRelationshipProblem";
import { extractFksFromPaths } from "./extractFksFromPaths";
import { locallyUpdateFkOnRecord } from "./locallyUpdateFkOnRecord";
import { sendRelnDispatchEvent } from "./relationships/sendRelnDispatchEvent";
/**
 * **relationshipOperation**
 *
 * updates the current Record while also executing the appropriate two-phased commit
 * with the `dispatch()` function; looking to associate with watchers wherever possible
 */
export async function relationshipOperation(rec, 
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
            FmEvents.RELATIONSHIP_SET_LOCALLY,
            FmEvents.RELATIONSHIP_SET_CONFIRMATION,
            FmEvents.RELATIONSHIP_SET_ROLLBACK
        ],
        clear: [
            FmEvents.RELATIONSHIP_REMOVED_LOCALLY,
            FmEvents.RELATIONSHIP_REMOVED_CONFIRMATION,
            FmEvents.RELATIONSHIP_REMOVED_ROLLBACK
        ],
        // update: [
        //   FMEvents.RELATIONSHIP_UPDATED_LOCALLY,
        //   FMEvents.RELATIONSHIP_UPDATED_CONFIRMATION,
        //   FMEvents.RELATIONSHIP_UPDATED_ROLLBACK
        // ],
        add: [
            FmEvents.RELATIONSHIP_ADDED_LOCALLY,
            FmEvents.RELATIONSHIP_ADDED_CONFIRMATION,
            FmEvents.RELATIONSHIP_ADDED_ROLLBACK
        ],
        remove: [
            FmEvents.RELATIONSHIP_REMOVED_LOCALLY,
            FmEvents.RELATIONSHIP_REMOVED_CONFIRMATION,
            FmEvents.RELATIONSHIP_REMOVED_ROLLBACK
        ]
    };
    try {
        const [localEvent, confirmEvent, rollbackEvent] = dispatchEvents[operation];
        const fkRecord = Record.create(rec.META.relationship(property).fkConstructor());
        const fkMeta = getModelMeta(fkRecord.data);
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
            throw new UnknownRelationshipProblem(e, rec, property, operation);
        }
    }
}
export async function localRelnOp(rec, op, prop, paths, event, transactionId) {
    // locally modify Record's values
    const ids = extractFksFromPaths(rec, prop, paths);
    ids.map(id => {
        locallyUpdateFkOnRecord(rec, op, prop, id);
    });
    // TODO: investigate why multiPathSet wasn't working
    // build MPS
    // const dbPaths = discoverRootPath(paths);
    // const mps = rec.db.multiPathSet(dbPaths.root || "/");
    // dbPaths.paths.map(p => mps.add({ path: p.path, value: p.value }));
    const fkRecord = Record.create(rec.META.relationship(prop).fkConstructor());
    // execute MPS on DB
    try {
        sendRelnDispatchEvent(event, transactionId, op, rec, prop, paths);
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
export async function relnConfirmation(rec, op, prop, paths, event, transactionId) {
    sendRelnDispatchEvent(event, transactionId, op, rec, prop, paths);
}
export async function relnRollback(rec, op, prop, paths, event, transactionId, err) {
    sendRelnDispatchEvent(event, transactionId, op, rec, prop, paths, err);
}
//# sourceMappingURL=relationshipOperation.js.map