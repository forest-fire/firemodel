export const VeuxWrapper = (vuexDispatch) => (reduxAction) => {
    const type = reduxAction.type;
    delete reduxAction.type;
    vuexDispatch(type, reduxAction);
};
//# sourceMappingURL=VuexWrapper.js.map