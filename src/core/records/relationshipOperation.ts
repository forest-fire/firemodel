import { FireModelProxyError, UnknownRelationshipProblem } from "@/errors";
import {
  FmEvents,
  IFkReference,
  IFmLocalRelationshipEvent,
  IFmPathValuePair,
  IFmRelationshipOperation,
  IFmRelationshipOptions,
  IFmRelationshipOptionsForHasMany,
} from "@/types";
import { capitalize, getModelMeta } from "@/util";
import { createCompositeRef, locallyUpdateFkOnRecord } from "./index";

import { IDictionary } from "common-types";
import { IModel } from "@/types";
import { Record } from "@/core";
import { Reference } from "firemock";

/**
 * **relationshipOperation**
 *
 * updates the current Record while also executing the appropriate two-phased commit
 * with the `dispatch()` function; looking to associate with watchers wherever possible
 */
export async function relationshipOperation<
  F extends IModel,
  T extends IModel = IModel
>(
  rec: Record<F>,
  /**
   * **operation**
   *
   * The relationship operation that is being executed
   */
  operation: IFmRelationshipOperation,
  /**
   * **property**
   *
   * The property on this model which changing its relationship status in some way
   */
  property: keyof F & string,
  /**
   * The array of _foreign keys_ (of the "from" model) which will be operated on
   */
  fkRefs: Array<IFkReference<T>>,
  /**
   * **paths**
   *
   * a set of name value pairs where the `name` is the DB path that needs updating
   * and the value is the value to set.
   */
  paths: IFmPathValuePair[],
  options: IFmRelationshipOptions | IFmRelationshipOptionsForHasMany = {}
) {
  // make sure all FK's are strings
  const fks = fkRefs.map((fk) => {
    return typeof fk === "object" ? createCompositeRef(fk) : fk;
  });
  const dispatchEvents = {
    set: [
      FmEvents.RELATIONSHIP_SET_LOCALLY,
      FmEvents.RELATIONSHIP_SET_CONFIRMATION,
      FmEvents.RELATIONSHIP_SET_ROLLBACK,
    ],
    clear: [
      FmEvents.RELATIONSHIP_REMOVED_LOCALLY,
      FmEvents.RELATIONSHIP_REMOVED_CONFIRMATION,
      FmEvents.RELATIONSHIP_REMOVED_ROLLBACK,
    ],
    // update: [
    //   FMEvents.RELATIONSHIP_UPDATED_LOCALLY,
    //   FMEvents.RELATIONSHIP_UPDATED_CONFIRMATION,
    //   FMEvents.RELATIONSHIP_UPDATED_ROLLBACK
    // ],
    add: [
      FmEvents.RELATIONSHIP_ADDED_LOCALLY,
      FmEvents.RELATIONSHIP_ADDED_CONFIRMATION,
      FmEvents.RELATIONSHIP_ADDED_ROLLBACK,
    ],
    remove: [
      FmEvents.RELATIONSHIP_REMOVED_LOCALLY,
      FmEvents.RELATIONSHIP_REMOVED_CONFIRMATION,
      FmEvents.RELATIONSHIP_REMOVED_ROLLBACK,
    ],
  };

  try {
    const [localEvent, confirmEvent, rollbackEvent] = dispatchEvents[operation];
    const fkConstructor = rec.META.relationship(property).fkConstructor;
    // TODO: fix the typing here to make sure fkConstructor knows it's type
    const fkRecord: Record<T> = new Record<T>(fkConstructor() as any);
    const fkMeta = getModelMeta(fkRecord.data);
    const transactionId: string =
      "t-reln-" +
      Math.random().toString(36).substr(2, 5) +
      "-" +
      Math.random().toString(36).substr(2, 5);

    const event: Omit<IFmLocalRelationshipEvent<F, T>, "type"> = {
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
      toConstructor: fkRecord.modelConstructor,
    };

    const inverseProperty = rec.META.relationship(property).inverseProperty;
    if (inverseProperty) {
      event.inverseProperty = inverseProperty as keyof T;
    }

    try {
      await localRelnOp(rec, event, localEvent);
      await relnConfirmation(rec, event, confirmEvent);
    } catch (e) {
      await relnRollback(rec, event, rollbackEvent);
      throw new FireModelProxyError(
        e,
        `Encountered an error executing a relationship operation between the "${
          event.from
        }" model and "${
          event.to
        }". The paths that were being modified were: ${event.paths
          .map((i) => i.path)
          .join("- \n")}\n A dispatch for a rollback event has been issued.`
      );
    }
  } catch (e) {
    if (e.firemodel) {
      throw e;
    } else {
      throw new UnknownRelationshipProblem(e, rec, property, operation);
    }
  }
}

export async function localRelnOp<F extends IModel, T extends IModel>(
  rec: Record<F>,
  event: Omit<IFmLocalRelationshipEvent<F, T>, "type">,
  type: FmEvents
) {
  try {
    // locally modify Record's values
    // const ids = extractFksFromPaths(rec, event.property, event.paths);
    event.fks.map((fk) => {
      locallyUpdateFkOnRecord(rec, fk, { ...event, type });
    });
    // local optimistic dispatch
    rec.dispatch({ ...event, type });
    const ref = rec.db.ref("/");
    // TODO: replace with multiPathSet/transaction
    await (ref as Reference).update(
      event.paths.reduce((acc: IDictionary, curr) => {
        acc[curr.path] = curr.value;
        return acc;
      }, {})
    );
  } catch (e) {
    throw new FireModelProxyError(
      e,
      `While operating doing a local relationship operation ran into an error. Note that the "paths" passed in were:\n${JSON.stringify(
        event.paths
      )}.\n\nThe underlying error message was:`
    );
  }
}

export async function relnConfirmation<F extends IModel, T extends IModel>(
  rec: Record<F>,
  event: Omit<IFmLocalRelationshipEvent<F, T>, "type">,
  type: FmEvents
) {
  rec.dispatch({ ...event, type });
}

export async function relnRollback<F extends IModel, T extends IModel>(
  rec: Record<F>,
  event: Omit<IFmLocalRelationshipEvent<F, T>, "type">,
  type: FmEvents
) {
  //
  /**
   * no writes will have actually been done to DB but
   * front end framework will need to know as it probably
   * adjusted _optimistically_
   */
  rec.dispatch({ ...event, type });
}
