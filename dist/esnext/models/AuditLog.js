var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { model, property, index } from "../decorators/index";
import { Model } from "../models/Model";
let AuditLog = /** @class */ (() => {
    let AuditLog = class AuditLog extends Model {
    };
    __decorate([
        property,
        index,
        __metadata("design:type", String)
    ], AuditLog.prototype, "modelName", void 0);
    __decorate([
        property,
        index,
        __metadata("design:type", String)
    ], AuditLog.prototype, "modelId", void 0);
    __decorate([
        property,
        __metadata("design:type", Array)
    ], AuditLog.prototype, "changes", void 0);
    __decorate([
        property,
        __metadata("design:type", String)
    ], AuditLog.prototype, "action", void 0);
    AuditLog = __decorate([
        model({ dbOffset: "_auditing" })
    ], AuditLog);
    return AuditLog;
})();
export { AuditLog };
//# sourceMappingURL=AuditLog.js.map