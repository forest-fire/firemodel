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
const src_1 = require("../../../src");
let MockedPerson2 = class MockedPerson2 extends src_1.Model {
};
__decorate([
    src_1.property,
    __metadata("design:type", Object)
], MockedPerson2.prototype, "name", void 0);
__decorate([
    src_1.property,
    __metadata("design:type", Number)
], MockedPerson2.prototype, "age", void 0);
__decorate([
    src_1.property,
    __metadata("design:type", String)
], MockedPerson2.prototype, "phoneNumber", void 0);
__decorate([
    src_1.property, src_1.mock("random", "fi", "fo", "fum"),
    __metadata("design:type", String)
], MockedPerson2.prototype, "group", void 0);
__decorate([
    src_1.property, src_1.mock("word"),
    __metadata("design:type", String)
], MockedPerson2.prototype, "subGroup", void 0);
MockedPerson2 = __decorate([
    src_1.model({ dbOffset: ":group/:subGroup/testing", localPostfix: "all" })
], MockedPerson2);
exports.MockedPerson2 = MockedPerson2;
//# sourceMappingURL=MockedPerson2.js.map