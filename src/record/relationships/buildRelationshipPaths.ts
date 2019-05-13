import {
  IFkReference,
  ICompositeKey,
  IFmPathValuePair,
  IFmBuildRelationshipOptions
} from "../..";
import { Record } from "../../Record";
import { getModelMeta } from "../../ModelMeta";
import { DynamicPropertiesNotReady } from "../../errors/DynamicPropertiesNotReady";
import { createCompositeKeyFromFkString } from "../createCompositeKeyFromFkString";
import { pathJoin, IDictionary } from "common-types";
import { MissingReciprocalInverse } from "../../errors/relationships/MissingReciprocalInverse";
import { IncorrectReciprocalInverse } from "../../errors/relationships/IncorrectReciprocalInverse";
import { createCompositeKeyString } from "../createCompositeKeyString";
import { UnknownRelationshipProblem } from "../../errors/relationships/UnknownRelationshipProblem";

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
  property: Extract<keyof T, string>,
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
    const fkRecord = Record.createWith(fkModelConstructor, fkRef);
    const results: IFmPathValuePair[] = [];

    /**
     * Regardless if we receive the string or ICompositeKey notation for the FK's
     * ID, we will normalize it to a ICompositeKey.
     */
    const fkCompositeKey: ICompositeKey =
      typeof fkRef === "object" ? fkRef : fkRecord.compositeKey;

    fkRecord._initialize({ ...fkRecord.data, ...fkCompositeKey });
    let fkId: string;

    // DEAL WITH DYNAMIC PATHS on FK
    if (fkRecord.hasDynamicPath) {
      const fkDynamicProps = fkRecord.dynamicPathComponents;
      /**
       * Sometimes the current model has all the properties needed
       * to populate the FK's dynamic path. This boolean flag indicates
       * whether that is the case.
       */
      const canAutoPopulate = fkDynamicProps.every(
        p =>
          this.data[p as keyof T] !== undefined ||
          this.data[p as keyof T] !== null
      )
        ? true
        : false;
      /**
       * This flag indicates whether the ref passed in just a simple string reference
       * to the FK model (false) or if it is a hash which represents
       * the composite FK reference.
       */
      const refIsCompositeKey = typeof fkRef === "object" ? true : false;

      if (!canAutoPopulate) {
        throw new DynamicPropertiesNotReady(
          this,
          `Attempt to add/remove a FK relationship on ${this.modelName} to ${
            fkRecord.modelName
          } failed because there was no way to resolve ${
            fkRecord.modelName
          }'s dynamic prefixes: [ ${fkDynamicProps} ]`
        );
      }
    }

    fkId = createCompositeKeyString(fkRecord);

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
      hasManyReln ? fkId : ""
    );

    // Add paths for current record
    results.push({
      path: pathToRecordsFkReln,
      value: hasManyReln ? altHasManyValue : fkId
    });
    results.push({ path: pathJoin(rec.dbPath, "lastUpdated"), value: now });

    // INVERSE RELATIONSHIP
    if (inverseProperty) {
      const fkMeta = getModelMeta(fkRecord);
      const inverseReln = fkMeta.relationship(inverseProperty);
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
        : null;

      // Inverse paths
      results.push({
        path: pathToInverseFkReln,
        value: fkInverseIsHasManyReln ? altHasManyValue : fkId
      });
      results.push({
        path: pathJoin(fkRecord.dbPath, "lastUpdated"),
        value: now
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
