import { IDictionary } from "common-types";
import { FMEvents, IFMRecordEvent, IFMRelationshipEvent } from "./index";
export declare const VuexMutations: <T = IDictionary<any>>() => {
    mutations: {
        [FMEvents.RECORD_ADDED](state: T, payload: IFMRecordEvent<import("../model").Model>): void;
        [FMEvents.RECORD_CHANGED](state: T, payload: IFMRecordEvent<import("../model").Model>): void;
        [FMEvents.RECORD_MOVED](state: T, payload: IFMRecordEvent<import("../model").Model>): void;
        [FMEvents.RECORD_REMOVED](state: T, payload: IFMRecordEvent<import("../model").Model>): void;
        [FMEvents.RELATIONSHIP_ADDED](state: T, payload: IFMRelationshipEvent<import("../model").Model>): void;
        [FMEvents.RELATIONSHIP_REMOVED](state: T, payload: IFMRelationshipEvent<import("../model").Model>): void;
    };
};
