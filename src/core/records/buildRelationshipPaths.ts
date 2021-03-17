import {
  ICompositeKey,
  IFkReference,
  IFmBuildRelationshipOptions,
  IFmPathValuePair,
} from "@/types";
import {
  IncorrectReciprocalInverse,
  MissingInverseProperty,
  MissingReciprocalInverse,
  UnknownRelationshipProblem,
} from "@/errors";

import { Record } from "@/core";
import { createCompositeKeyRefFromRecord } from "./index";
import { getModelMeta, pathJoin } from "@/util";

/**
 * Builds all the DB paths needed to update a pairing of a PK:FK. It is intended
 * to be used by the `Record`'s transactional API as a first step of specifying
 * the FULL atomic transaction that will be executed as a "multi-path set" on
 * Firebase.
 *
 * If the operation requires the removal o relationship then set this in the
 * optional hash.
 *
 * @param rec the `Record` which holds the FK reference to an external entity
 * @param property the _property_ on the `Record` which holds the FK id
 * @param fkRef the "id" for the FK which is being worked on
 */
export function buildRelationshipPaths<T>(
  rec: Record<T>,
  property: keyof T & string,
  fkRef: IFkReference,
  options: IFmBuildRelationshipOptions = {}
): IFmPathValuePair[] {
  try {
    const meta = getModelMeta(rec);
    const now = options.now || new Date().getTime();
    const operation = options.operation || "add";
    const altHasManyValue = options.altHasManyValue || true;
    const fkModelConstructor = meta.relationship(property).fkConstructor();
    const inverseProperty = meta.relationship(property).inverseProperty;
    const fkRecord = Record.createWith(fkModelConstructor, fkRef, {
      db: options.db || rec.db,
    });
    const results: IFmPathValuePair[] = [];

    /**
     * Normalize to a composite key format
     */
    const fkCompositeKey: ICompositeKey =
      typeof fkRef === "object" ? fkRef : fkRecord.compositeKey;

    const fkId: string = createCompositeKeyRefFromRecord(fkRecord);

    /**
     * boolean flag indicating whether current model has a **hasMany** relationship
     * with the FK.
     */
    const hasManyReln =
      meta.isRelationship(property) &&
      meta.relationship(property).relType === "hasMany";

    const pathToRecordsFkReln = pathJoin(
      rec.dbPath, // this includes dynamic segments for originating model
      property,
      // we must add the fk id to path (versus value) to make the write non-destructive
      // to other hasMany keys which already exist
      hasManyReln ? fkId : undefined
    );

    // Add paths for current record
    results.push({
      path: pathToRecordsFkReln,
      value:
        operation === "remove" ? null : hasManyReln ? altHasManyValue : fkId,
    });
    results.push({ path: pathJoin(rec.dbPath, "lastUpdated"), value: now });

    // INVERSE RELATIONSHIP
    if (inverseProperty) {
      const fkMeta = getModelMeta(fkRecord);
      const inverseReln = fkMeta.relationship(inverseProperty);

      if (!inverseReln) {
        throw new MissingInverseProperty(rec, property);
      }

      if (
        !inverseReln.inverseProperty &&
        inverseReln.directionality === "bi-directional"
      ) {
        throw new MissingReciprocalInverse(rec, property);
      }
      if (
        inverseReln.inverseProperty !== property &&
        inverseReln.directionality === "bi-directional"
      ) {
        throw new IncorrectReciprocalInverse(rec, property);
      }

      const fkInverseIsHasManyReln = inverseProperty
        ? fkMeta.relationship(inverseProperty).relType === "hasMany"
        : false;
      const pathToInverseFkReln = fkInverseIsHasManyReln
        ? pathJoin(fkRecord.dbPath, inverseProperty, rec.compositeKeyRef)
        : pathJoin(fkRecord.dbPath, inverseProperty);

      // Inverse paths
      results.push({
        path: pathToInverseFkReln,
        value:
          operation === "remove"
            ? null
            : fkInverseIsHasManyReln
            ? altHasManyValue
            : rec.compositeKeyRef,
      });
      results.push({
        path: pathJoin(fkRecord.dbPath, "lastUpdated"),
        value: now,
      });
    }
    // TODO: add validation of FK paths if option is set

    return results;
  } catch (e) {
    if (e.firemodel) {
      console.log(e);

      throw e;
    }
    throw new UnknownRelationshipProblem(e, rec, property);
  }
}
