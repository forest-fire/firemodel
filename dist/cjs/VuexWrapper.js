"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeuxWrapper = (vuexDispatch) => (reduxAction) => {
    const type = reduxAction.type;
    delete reduxAction.type;
    vuexDispatch(type, reduxAction);
};
//# sourceMappingURL=VuexWrapper.js.map