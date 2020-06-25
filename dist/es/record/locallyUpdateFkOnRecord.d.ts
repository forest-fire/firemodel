import { IFmLocalRelationshipEvent, Model, Record } from "../private";
import { fk } from "common-types";
/**
 * sets the `Record` property to the optimistic values set
 * with the relationship CRUD event.
 *
 * This function has no concern with dispatch or the FK model
 * and any updates that may need to take place there.
 */
export declare function locallyUpdateFkOnRecord<F extends Model, T extends Model>(rec: Record<F>, fkId: fk, event: IFmLocalRelationshipEvent<F, T>): void;
