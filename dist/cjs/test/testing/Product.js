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
let Product = class Product extends src_1.Model {
};
__decorate([
    src_1.property, src_1.mock("name"),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    src_1.property,
    __metadata("design:type", String)
], Product.prototype, "category", void 0);
__decorate([
    src_1.property, src_1.mock("number", { min: 10, max: 100 }),
    __metadata("design:type", Number)
], Product.prototype, "minCost", void 0);
__decorate([
    src_1.property,
    __metadata("design:type", Boolean)
], Product.prototype, "isInStock", void 0);
Product = __decorate([
    src_1.model({ dbOffset: "authenticated" })
], Product);
exports.Product = Product;
//# sourceMappingURL=Product.js.map