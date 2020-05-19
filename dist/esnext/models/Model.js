var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { property } from "../decorators/constraints";
import { mock } from "../decorators/mock";
import { model } from "../decorators/model";
import { index } from "../decorators/indexing";
let Model = /** @class */ (() => {
    let Model = class Model {
    };
    __decorate([
        property,
        __metadata("design:type", String)
    ], Model.prototype, "id", void 0);
    __decorate([
        property,
        mock("dateRecentMiliseconds"),
        index,
        __metadata("design:type", Number)
    ], Model.prototype, "lastUpdated", void 0);
    __decorate([
        property,
        mock("datePastMiliseconds"),
        index,
        __metadata("design:type", Number)
    ], Model.prototype, "createdAt", void 0);
    Model = __decorate([
        model()
    ], Model);
    return Model;
})();
export { Model };
//# sourceMappingURL=Model.js.map