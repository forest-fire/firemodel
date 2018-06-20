import { IDictionary } from "common-types";
import { FMEvents, IFMRecordEvent, IFMRelationshipEvent } from "./index";
import { get, set } from "lodash";
import { pathJoin } from "../path";

export const VuexMutations = <T = IDictionary>() => ({
  mutations: {
    [FMEvents.RECORD_ADDED](state: T, payload: IFMRecordEvent) {
      get(state, payload.localPath).push(payload.key);
    },

    [FMEvents.RECORD_CHANGED](state: T, payload: IFMRecordEvent) {
      set(
        state as any,
        pathJoin(payload.localPath, payload.key).replace(/\//g, "."),
        payload.value
      );
    },
    [FMEvents.RECORD_MOVED](state: T, payload: IFMRecordEvent) {
      set(
        state as any,
        pathJoin(payload.localPath, payload.key).replace(/\//g, "."),
        payload.value
      );
    },
    [FMEvents.RECORD_REMOVED](state: T, payload: IFMRecordEvent) {
      delete get(state, payload.localPath)[payload.key];
    },

    [FMEvents.RELATIONSHIP_ADDED](state: T, payload: IFMRelationshipEvent) {
      //
    },
    [FMEvents.RELATIONSHIP_REMOVED](state: T, payload: IFMRelationshipEvent) {
      //
    }
  }
});
