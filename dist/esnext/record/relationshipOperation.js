import { Record } from "../Record";
import { FmEvents } from "..";
import { getModelMeta } from "../ModelMeta";
import { UnknownRelationshipProblem } from "../errors/relationships/UnknownRelationshipProblem";
import { locallyUpdateFkOnRecord } from "./locallyUpdateFkOnRecord";
import { createCompositeRef } from "./createCompositeKeyString";
import { capitalize } from "../util";
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
    const fks = fkRefs.map(fk => {
        return typeof fk === "object" ? createCompositeRef(fk) : fk;
    });
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
        const fkConstructor = rec.META.relationship(property).fkConstructor;
        // TODO: fix the typing here to make sure fkConstructor knows it's type
        const fkRecord = new Record(fkConstructor());
        const fkMeta = getModelMeta(fkRecord.data);
        const transactionId = "t-reln-" +
            Math.random()
                .toString(36)
                .substr(2, 5) +
            "-" +
            Math.random()
                .toString(36)
                .substr(2, 5);
        const event = {
            key: rec.compositeKeyRef,
            operation,
            property,
            kind: "relationship",
            eventType: "local",
            transactionId,
            fks,
            paths,
            from: capitalize(rec.modelName),
            to: capitalize(fkRecord.modelName),
            fromLocal: rec.localPath,
            toLocal: fkRecord.localPath,
            fromConstructor: rec.modelConstructor,
            toConstructor: fkRecord.modelConstructor
        };
        const inverseProperty = rec.META.relationship(property).inverseProperty;
        if (inverseProperty) {
            event.inverseProperty = inverseProperty;
        }
        try {
            await localRelnOp(rec, event, localEvent);
        }
        catch (e) {
            await relnRollback(rec, event, rollbackEvent);
        }
        await relnConfirmation(rec, event, confirmEvent);
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
export async function localRelnOp(rec, event, type) {
    try {
        // locally modify Record's values
        // const ids = extractFksFromPaths(rec, event.property, event.paths);
        event.fks.map(fk => {
            locallyUpdateFkOnRecord(rec, fk, Object.assign({}, event, { type }));
        });
        // local optimistic dispatch
        rec.dispatch(Object.assign({}, event, { type }));
        await rec.db.ref("/").update(event.paths.reduce((acc, curr) => {
            acc[curr.path] = curr.value;
            return acc;
        }, {}));
    }
    catch (e) {
        // TODO: complete err handling
        throw e;
    }
}
export async function relnConfirmation(rec, event, type) {
    rec.dispatch(Object.assign({}, event, { type }));
}
export async function relnRollback(rec, event, type) {
    //
    /**
     * no writes will have actually been done to DB but
     * front end framework will need to know as it probably
     * adjusted _optimistically_
     */
    rec.dispatch(Object.assign({}, event, { type }));
}
//# sourceMappingURL=relationshipOperation.js.map