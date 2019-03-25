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
let School = class School extends src_1.Model {
};
__decorate([
    src_1.property, src_1.mock("companyName"),
    __metadata("design:type", String)
], School.prototype, "name", void 0);
__decorate([
    src_1.property, src_1.mock("stateAbbr"),
    __metadata("design:type", String)
], School.prototype, "state", void 0);
__decorate([
    src_1.property,
    __metadata("design:type", String)
], School.prototype, "group", void 0);
__decorate([
    src_1.hasMany(() => DeepPerson_1.default, "school"),
    __metadata("design:type", Object)
], School.prototype, "students", void 0);
School = __decorate([
    src_1.model({})
], School);
exports.default = School;
//# sourceMappingURL=School.js.map