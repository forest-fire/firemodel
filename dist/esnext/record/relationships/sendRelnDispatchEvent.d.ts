import { Model } from "../..";
import { FmEvents, IFmLocalRelationshipEvent } from "../../state-mgmt";
export declare function sendRelnDispatchEvent<F extends Model, T extends Model>(type: FmEvents, event: IFmLocalRelationshipEvent<F, T>): void;
