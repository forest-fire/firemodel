import { FMEvents } from "./index";
import { get, set } from "lodash";
// tslint:disable-next-line:no-var-requires
const pathJoin = require("path.join");
export const VuexMutations = () => ({
    mutations: {
        [FMEvents.RECORD_ADDED](state, payload) {
            get(state, payload.localPath).push(payload.key);
        },
        [FMEvents.RECORD_CHANGED](state, payload) {
            set(state, pathJoin(payload.localPath, payload.key).replace(/\//g, "."), payload.value);
        },
        [FMEvents.RECORD_MOVED](state, payload) {
            set(state, pathJoin(payload.localPath, payload.key).replace(/\//g, "."), payload.value);
        },
        [FMEvents.RECORD_REMOVED](state, payload) {
            delete get(state, payload.localPath)[payload.key];
        },
        [FMEvents.RELATIONSHIP_ADDED](state, payload) {
            //
        },
        [FMEvents.RELATIONSHIP_REMOVED](state, payload) {
            //
        }
    }
});
//# sourceMappingURL=VuexMutations.js.map