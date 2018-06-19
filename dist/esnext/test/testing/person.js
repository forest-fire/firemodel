var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Person_1;
import { Model, property, min, max, length, model, ownedBy, hasMany, inverse } from "../../src";
import { Company } from "./company";
import { pushKey } from "../../src/decorators/property";
import { Concert } from "./Concert";
let Person = Person_1 = class Person extends Model {
};
__decorate([
    property, length(20),
    __metadata("design:type", String)
], Person.prototype, "name", void 0);
__decorate([
    property, min(1), max(100),
    __metadata("design:type", Number)
], Person.prototype, "age", void 0);
__decorate([
    property,
    __metadata("design:type", String)
], Person.prototype, "gender", void 0);
__decorate([
    property,
    __metadata("design:type", Object)
], Person.prototype, "scratchpad", void 0);
__decorate([
    property, pushKey,
    __metadata("design:type", Object)
], Person.prototype, "tags", void 0);
__decorate([
    ownedBy(Person_1), inverse("children"),
    __metadata("design:type", String)
], Person.prototype, "mother", void 0);
__decorate([
    ownedBy(Person_1), inverse("children"),
    __metadata("design:type", String)
], Person.prototype, "father", void 0);
__decorate([
    hasMany(Person_1),
    __metadata("design:type", Object)
], Person.prototype, "children", void 0);
__decorate([
    hasMany(Concert),
    __metadata("design:type", Object)
], Person.prototype, "concerts", void 0);
__decorate([
    ownedBy(Company),
    __metadata("design:type", String)
], Person.prototype, "employerId", void 0);
Person = Person_1 = __decorate([
    model({ dbOffset: "authenticated" })
], Person);
export { Person };
//# sourceMappingURL=person.js.map