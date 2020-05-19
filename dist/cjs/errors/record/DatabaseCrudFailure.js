"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordCrudFailure = void 0;
const FireModelError_1 = require("../FireModelError");
const util_1 = require("../../util");
class RecordCrudFailure extends FireModelError_1.FireModelError {
    constructor(rec, crudAction, transactionId, e) {
        super("", e.name !== "Error" ? e.name : `firemodel/record-${crudAction}-failure`);
        const message = `Attempt to "${crudAction}" "${util_1.capitalize(rec.modelName)}::${rec.id}" failed [ ${transactionId} ] ${e ? e.message : "for unknown reasons"}`;
        this.message = message;
        this.stack = e.stack;
    }
}
exports.RecordCrudFailure = RecordCrudFailure;
//# sourceMappingURL=DatabaseCrudFailure.js.map