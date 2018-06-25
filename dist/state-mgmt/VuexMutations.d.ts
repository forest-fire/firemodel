import { IDictionary } from "common-types";
import { FMEvents, IFMRecordEvent, IFMRelationshipEvent } from "./index";
export declare const VuexMutations: <T = IDictionary<any>>() => {
    mutations: {
        [FMEvents.RECORD_ADDED](state: T, payload: IFMRecordEvent<import("../../../../../../../Users/ken/mine/forest-fire/firemodel/src/Model").Model>): void;
        [FMEvents.RECORD_CHANGED](state: T, payload: IFMRecordEvent<import("../../../../../../../Users/ken/mine/forest-fire/firemodel/src/Model").Model>): void;
        [FMEvents.RECORD_MOVED](state: T, payload: IFMRecordEvent<import("../../../../../../../Users/ken/mine/forest-fire/firemodel/src/Model").Model>): void;
        [FMEvents.RECORD_REMOVED](state: T, payload: IFMRecordEvent<import("../../../../../../../Users/ken/mine/forest-fire/firemodel/src/Model").Model>): void;
        [FMEvents.RELATIONSHIP_ADDED](state: T, payload: IFMRelationshipEvent<import("../../../../../../../Users/ken/mine/forest-fire/firemodel/src/Model").Model>): void;
        [FMEvents.RELATIONSHIP_REMOVED](state: T, payload: IFMRelationshipEvent<import("../../../../../../../Users/ken/mine/forest-fire/firemodel/src/Model").Model>): void;
    };
};
