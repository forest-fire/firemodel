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
const src_1 = require("../../src");
const constraints_1 = require("../../src/decorators/constraints");
const Person_1 = require("./Person");
function modelYear() {
    return 2018 - Math.floor(Math.random() * 10);
}
let Car = class Car extends src_1.Model {
};
__decorate([
    src_1.property,
    __metadata("design:type", String)
], Car.prototype, "model", void 0);
__decorate([
    src_1.property,
    __metadata("design:type", Number)
], Car.prototype, "cost", void 0);
__decorate([
    src_1.property, constraints_1.mock(modelYear), src_1.index,
    __metadata("design:type", Number)
], Car.prototype, "modelYear", void 0);
__decorate([
    src_1.hasOne(() => Person_1.Person),
    __metadata("design:type", String)
], Car.prototype, "owner", void 0);
Car = __decorate([
    src_1.model({ dbOffset: "car-offset" })
], Car);
exports.Car = Car;
//# sourceMappingURL=Car.js.map