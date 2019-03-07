import { FMEvents } from "../state-mgmt";
import { IDictionary } from "common-types";
export default function createWatchEvent(type: keyof FMEvents, recordContext: IDictionary): void;
