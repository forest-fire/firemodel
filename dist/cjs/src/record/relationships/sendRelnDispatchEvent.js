"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const util_1 = require("../../util");
function sendRelnDispatchEvent(type, transactionId, operation, rec, property, paths, err) {
    const fkModel = __1.Record.create(rec.META.relationship(property).fkConstructor());
    let payload = {
        type,
        transactionId,
        operation,
        from: util_1.capitalize(rec.modelName),
        to: util_1.capitalize(fkModel.modelName),
        paths,
        fromLocal: rec.localPath,
        toLocal: fkModel.localPath,
        value: Object.assign({}, rec.data)
    };
    if (err) {
        payload = Object.assign({}, payload, {
            errCode: err.code || err.name,
            errMessage: err.message
        });
    }
    rec.dispatch(payload);
}
exports.sendRelnDispatchEvent = sendRelnDispatchEvent;
//# sourceMappingURL=sendRelnDispatchEvent.js.map