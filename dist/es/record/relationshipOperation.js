"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Record_1 = require("../Record");
const __1 = require("..");
const ModelMeta_1 = require("../ModelMeta");
const UnknownRelationshipProblem_1 = require("../errors/relationships/UnknownRelationshipProblem");
const locallyUpdateFkOnRecord_1 = require("./locallyUpdateFkOnRecord");
const createCompositeKeyString_1 = require("./createCompositeKeyString");
const util_1 = require("../util");
const errors_1 = require("../errors");
/**
 * **relationshipOperation**
 *
 * updates the current Record while also executing the appropriate two-phased commit
 * with the `dispatch()` function; looking to associate with watchers wherever possible
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
 * The array of _foreign keys_ (of the "from" model) which will be operated on
 */
fkRefs, 
/**
 * **paths**
 *
 * a set of name value pairs where the `name` is the DB path that needs updating
 * and the value is the value to set.
 */
paths, options = {}) {
    // make sure all FK's are strings
    const fks = fkRefs.map((fk) => {
        return typeof fk === "object" ? createCompositeKeyString_1.createCompositeRef(fk) : fk;
    });
    const dispatchEvents = {
        set: [
            __1.FmEvents.RELATIONSHIP_SET_LOCALLY,
            __1.FmEvents.RELATIONSHIP_SET_CONFIRMATION,
            __1.FmEvents.RELATIONSHIP_SET_ROLLBACK,
        ],
        clear: [
            __1.FmEvents.RELATIONSHIP_REMOVED_LOCALLY,
            __1.FmEvents.RELATIONSHIP_REMOVED_CONFIRMATION,
            __1.FmEvents.RELATIONSHIP_REMOVED_ROLLBACK,
        ],
        // update: [
        //   FMEvents.RELATIONSHIP_UPDATED_LOCALLY,
        //   FMEvents.RELATIONSHIP_UPDATED_CONFIRMATION,
        //   FMEvents.RELATIONSHIP_UPDATED_ROLLBACK
        // ],
        add: [
            __1.FmEvents.RELATIONSHIP_ADDED_LOCALLY,
            __1.FmEvents.RELATIONSHIP_ADDED_CONFIRMATION,
            __1.FmEvents.RELATIONSHIP_ADDED_ROLLBACK,
        ],
        remove: [
            __1.FmEvents.RELATIONSHIP_REMOVED_LOCALLY,
            __1.FmEvents.RELATIONSHIP_REMOVED_CONFIRMATION,
            __1.FmEvents.RELATIONSHIP_REMOVED_ROLLBACK,
        ],
    };
    try {
        const [localEvent, confirmEvent, rollbackEvent] = dispatchEvents[operation];
        const fkConstructor = rec.META.relationship(property).fkConstructor;
        // TODO: fix the typing here to make sure fkConstructor knows it's type
        const fkRecord = new Record_1.Record(fkConstructor());
        const fkMeta = ModelMeta_1.getModelMeta(fkRecord.data);
        const transactionId = "t-reln-" +
            Math.random().toString(36).substr(2, 5) +
            "-" +
            Math.random().toString(36).substr(2, 5);
        const event = {
            key: rec.compositeKeyRef,
            operation,
            property,
            kind: "relationship",
            eventType: "local",
            transactionId,
            fks,
            paths,
            from: util_1.capitalize(rec.modelName),
            to: util_1.capitalize(fkRecord.modelName),
            fromLocal: rec.localPath,
            toLocal: fkRecord.localPath,
            fromConstructor: rec.modelConstructor,
            toConstructor: fkRecord.modelConstructor,
        };
        const inverseProperty = rec.META.relationship(property).inverseProperty;
        if (inverseProperty) {
            event.inverseProperty = inverseProperty;
        }
        try {
            await localRelnOp(rec, event, localEvent);
            await relnConfirmation(rec, event, confirmEvent);
        }
        catch (e) {
            await relnRollback(rec, event, rollbackEvent);
            throw new errors_1.FireModelProxyError(e, `Encountered an error executing a relationship operation between the "${event.from}" model and "${event.to}". The paths that were being modified were: ${event.paths
                .map((i) => i.path)
                .join("- \n")}\n A dispatch for a rollback event has been issued.`);
        }
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
async function localRelnOp(rec, event, type) {
    try {
        // locally modify Record's values
        // const ids = extractFksFromPaths(rec, event.property, event.paths);
        event.fks.map((fk) => {
            locallyUpdateFkOnRecord_1.locallyUpdateFkOnRecord(rec, fk, { ...event, type });
        });
        // local optimistic dispatch
        rec.dispatch({ ...event, type });
        const ref = rec.db.ref("/");
        // TODO: replace with multiPathSet/transaction
        await ref.update(event.paths.reduce((acc, curr) => {
            acc[curr.path] = curr.value;
            return acc;
        }, {}));
    }
    catch (e) {
        throw new errors_1.FireModelProxyError(e, `While operating doing a local relationship operation ran into an error. Note that the "paths" passed in were:\n${JSON.stringify(event.paths)}.\n\nThe underlying error message was:`);
    }
}
exports.localRelnOp = localRelnOp;
async function relnConfirmation(rec, event, type) {
    rec.dispatch({ ...event, type });
}
exports.relnConfirmation = relnConfirmation;
async function relnRollback(rec, event, type) {
    //
    /**
     * no writes will have actually been done to DB but
     * front end framework will need to know as it probably
     * adjusted _optimistically_
     */
    rec.dispatch({ ...event, type });
}
exports.relnRollback = relnRollback;
//# sourceMappingURL=relationshipOperation.js.map