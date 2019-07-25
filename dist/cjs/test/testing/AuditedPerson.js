"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
const Company_1 = require("./Company");
const Concert_1 = require("./Concert");
function bespokeMock(context) {
    return context.faker.name.firstName() + ", hello to you";
}
let Person = Person_1 = class Person extends src_1.Model {
};
__decorate([
    src_1.property, src_1.length(20),
    __metadata("design:type", String)
], Person.prototype, "name", void 0);
__decorate([
    src_1.property, src_1.min(1), src_1.max(100),
    __metadata("design:type", Number)
], Person.prototype, "age", void 0);
__decorate([
    src_1.property,
    __metadata("design:type", String)
], Person.prototype, "gender", void 0);
__decorate([
    src_1.property,
    __metadata("design:type", Object)
], Person.prototype, "scratchpad", void 0);
__decorate([
    src_1.property, src_1.pushKey,
    __metadata("design:type", Object)
], Person.prototype, "tags", void 0);
__decorate([
    src_1.hasOne(() => Person_1, "parents"),
    __metadata("design:type", String)
], Person.prototype, "mother", void 0);
__decorate([
    src_1.hasOne(() => Person_1, "parents"),
    __metadata("design:type", String)
], Person.prototype, "father", void 0);
__decorate([
    src_1.hasMany(() => Person_1),
    __metadata("design:type", Object)
], Person.prototype, "parents", void 0);
__decorate([
    src_1.hasOne(() => Concert_1.Concert),
    __metadata("design:type", Object)
], Person.prototype, "concerts", void 0);
__decorate([
    src_1.hasOne(() => Company_1.Company),
    __metadata("design:type", String)
], Person.prototype, "company", void 0);
Person = Person_1 = __decorate([
    src_1.model({ dbOffset: "authenticated", audit: true })
], Person);
exports.Person = Person;
//# sourceMappingURL=AuditedPerson.js.map