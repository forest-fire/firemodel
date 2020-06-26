import { IFkReference, IFmBuildRelationshipOptions, IFmPathValuePair } from "../../../@types/index";
import { Record } from "../..";
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
export declare function buildRelationshipPaths<T>(rec: Record<T>, property: keyof T & string, fkRef: IFkReference, options?: IFmBuildRelationshipOptions): IFmPathValuePair[];
