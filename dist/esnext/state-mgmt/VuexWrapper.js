/**
 * wraps a Vuex function's to Mutation.commit() function so it's
 * signature looks like a Redux call to dispatch
 */
export function VeuxWrapper(vuexDispatch) {
    /** vuex wrapped redux dispatch function */
    return async (reduxAction) => {
        const type = reduxAction.type;
        delete reduxAction.type;
        return vuexDispatch(type, reduxAction);
    };
}
//# sourceMappingURL=VuexWrapper.js.map