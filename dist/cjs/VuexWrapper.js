"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * wraps a Vuex function's to Mutation.commit() function so it's
 * signature looks like a Redux call to dispatch
 */
function VeuxWrapper(vuexDispatch) {
    /** vuex wrapped redux dispatch function */
    return async (reduxAction) => {
        const type = reduxAction.type;
        delete reduxAction.type;
        return vuexDispatch(type, reduxAction);
    };
}
exports.VeuxWrapper = VeuxWrapper;
//# sourceMappingURL=VuexWrapper.js.map