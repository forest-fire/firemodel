var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { property, mock } from "./decorators/property";
export var RelationshipPolicy;
(function (RelationshipPolicy) {
    RelationshipPolicy["keys"] = "keys";
    RelationshipPolicy["lazy"] = "lazy";
    RelationshipPolicy["inline"] = "inline";
})(RelationshipPolicy || (RelationshipPolicy = {}));
export var RelationshipCardinality;
(function (RelationshipCardinality) {
    RelationshipCardinality["hasMany"] = "hasMany";
    RelationshipCardinality["belongsTo"] = "belongsTo";
})(RelationshipCardinality || (RelationshipCardinality = {}));
export class Model {
    toString() {
        const obj = {};
        this.META.properties.map(p => {
            obj[p.property] = this[p.property];
        });
        return JSON.stringify(obj);
    }
}
__decorate([
    property,
    __metadata("design:type", String)
], Model.prototype, "id", void 0);
__decorate([
    property,
    mock("dateRecentMiliseconds"),
    __metadata("design:type", Number)
], Model.prototype, "lastUpdated", void 0);
__decorate([
    property,
    mock("datePastMiliseconds"),
    __metadata("design:type", Number)
], Model.prototype, "createdAt", void 0);
//# sourceMappingURL=Model.js.map