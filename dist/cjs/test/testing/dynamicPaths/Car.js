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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../../src");
const DeepPerson_1 = __importDefault(require("./DeepPerson"));
let Car = class Car extends src_1.Model {
};
__decorate([
    src_1.property, src_1.mock("companyName"),
    __metadata("design:type", String)
], Car.prototype, "name", void 0);
__decorate([
    src_1.property, src_1.mock("sequence", "Chevy", "Ford"),
    __metadata("design:type", String)
], Car.prototype, "vendor", void 0);
__decorate([
    src_1.property, src_1.mock("word"),
    __metadata("design:type", String)
], Car.prototype, "model", void 0);
__decorate([
    src_1.property, src_1.mock("number", { min: 1970, max: 2018 }),
    __metadata("design:type", String)
], Car.prototype, "year", void 0);
__decorate([
    src_1.hasMany(() => DeepPerson_1.default, "cars"),
    __metadata("design:type", Object)
], Car.prototype, "owners", void 0);
Car = __decorate([
    src_1.model({ dbOffset: "vendor/:vendor" })
], Car);
exports.default = Car;
//# sourceMappingURL=Car.js.map