var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Function ? never : P;
[keyof, T];
import { property } from "./decorators/property";
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
export class BaseSchema {
    toString() {
        const obj = {};
        this.META.properties.map(p => {
            obj[p.property] = this[p.property];
        });
        return JSON.stringify(obj);
    }
}
__decorate([
    property
], BaseSchema.prototype, "id", void 0);
__decorate([
    property
], BaseSchema.prototype, "lastUpdated", void 0);
__decorate([
    property
], BaseSchema.prototype, "createdAt", void 0);
