import { Model, Record } from "../..";
import { FmEvents } from "../../state-mgmt";
import { IFmPathValuePair, IFmRelationshipOperation } from "../../@types";
import { FireModelError } from "../../errors";
export declare function sendRelnDispatchEvent<T extends Model>(type: FmEvents, transactionId: string, operation: IFmRelationshipOperation, rec: Record<T>, property: keyof T, paths: IFmPathValuePair[], err?: FireModelError): void;
