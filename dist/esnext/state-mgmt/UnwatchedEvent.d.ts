import { IFmServerOrLocalEvent } from "../state-mgmt";
import { Record } from "../index";
export declare function UnwatchedEvent<T>(rec: Record<T>, event: IFmServerOrLocalEvent<T>): void;
