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
Object.defineProperty(exports, "__esModule", { value: true });
var FancyPerson_1;
const src_1 = require("../../src");
const Company_1 = require("./Company");
const Car_1 = require("./Car");
function bespokeMock(context) {
    return context.faker.name.firstName() + ", hello to you";
}
let FancyPerson = FancyPerson_1 = class FancyPerson extends src_1.Model {
};
__decorate([
    src_1.property,
    __metadata("design:type", String)
], FancyPerson.prototype, "name", void 0);
__decorate([
    src_1.property, src_1.min(0),
    __metadata("design:type", Number)
], FancyPerson.prototype, "age", void 0);
__decorate([
    src_1.property,
    __metadata("design:type", String)
], FancyPerson.prototype, "phoneNumber", void 0);
__decorate([
    src_1.property, src_1.mock("phoneNumber"),
    __metadata("design:type", String)
], FancyPerson.prototype, "otherPhone", void 0);
__decorate([
    src_1.property, src_1.mock(bespokeMock),
    __metadata("design:type", String)
], FancyPerson.prototype, "foobar", void 0);
__decorate([
    src_1.belongsTo(() => Company_1.Company),
    __metadata("design:type", String)
], FancyPerson.prototype, "employer", void 0);
__decorate([
    src_1.hasMany(() => Car_1.Car, "owner"),
    __metadata("design:type", Object)
], FancyPerson.prototype, "cars", void 0);
__decorate([
    src_1.hasMany(() => FancyPerson_1, "children"),
    __metadata("design:type", Object)
], FancyPerson.prototype, "parents", void 0);
__decorate([
    src_1.hasMany(() => FancyPerson_1, "parents"),
    __metadata("design:type", Object)
], FancyPerson.prototype, "children", void 0);
FancyPerson = FancyPerson_1 = __decorate([
    src_1.model({ dbOffset: "authenticated" })
], FancyPerson);
exports.FancyPerson = FancyPerson;
//# sourceMappingURL=FancyPerson.js.map