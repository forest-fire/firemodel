"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FkDoesNotExist = void 0;
const FireModelError_1 = require("../FireModelError");
class FkDoesNotExist extends FireModelError_1.FireModelError {
    constructor(pk, property, fkId) {
        // TODO: is this typing right for constructor?
        const fkConstructor = pk.META.relationship("property").fkConstructor();
        const fkModel = new fkConstructor();
        const message = `Attempt add a FK on of "${pk.constructor.name}::${fkId}" failed because the model "${fkModel.constructor.name}::${fkId}" doesn't exist!`;
        super(message, "firemodel/fk-does-not-exist");
    }
}
exports.FkDoesNotExist = FkDoesNotExist;
//# sourceMappingURL=FkDoesNotExist.js.map