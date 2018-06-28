"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const lodash_1 = require("lodash");
const path_1 = require("../path");
exports.VuexMutations = () => ({
    mutations: {
        [index_1.FMEvents.RECORD_ADDED](state, payload) {
            lodash_1.get(state, payload.localPath).push(payload.key);
        },
        [index_1.FMEvents.RECORD_CHANGED](state, payload) {
            lodash_1.set(state, path_1.pathJoin(payload.localPath, payload.key).replace(/\//g, "."), payload.value);
        },
        [index_1.FMEvents.RECORD_MOVED](state, payload) {
            lodash_1.set(state, path_1.pathJoin(payload.localPath, payload.key).replace(/\//g, "."), payload.value);
        },
        [index_1.FMEvents.RECORD_REMOVED](state, payload) {
            delete lodash_1.get(state, payload.localPath)[payload.key];
        },
        [index_1.FMEvents.RELATIONSHIP_ADDED](state, payload) {
            //
        },
        [index_1.FMEvents.RELATIONSHIP_REMOVED](state, payload) {
            //
        }
    }
});
//# sourceMappingURL=VuexMutations.js.map