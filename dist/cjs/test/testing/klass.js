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
class SubKlass extends src_1.Model {
    constructor() {
        super(...arguments);
        this.sub = "subklass";
    }
}
__decorate([
    src_1.property,
    __metadata("design:type", String)
], SubKlass.prototype, "sub", void 0);
exports.SubKlass = SubKlass;
class ContainedKlass {
    constructor() {
        this.c1 = 1;
        this.c2 = 1;
        this.c3 = 1;
    }
}
exports.ContainedKlass = ContainedKlass;
/** a schema class */
let Klass = class Klass extends SubKlass {
    /** a schema class */
    constructor() {
        super(...arguments);
        // prettier-ignore
        this.bar = 8;
        // prettier-ignore
        this.bar2 = 12;
    }
};
__decorate([
    src_1.desc("who doesn't love a foobar?"), src_1.property, src_1.length(15),
    __metadata("design:type", String)
], Klass.prototype, "foobar", void 0);
__decorate([
    src_1.property,
    __metadata("design:type", String)
], Klass.prototype, "foo", void 0);
__decorate([
    src_1.desc("the bar is a numeric property that holds no real meaning"), src_1.property, src_1.constrain("min", 2),
    __metadata("design:type", Number)
], Klass.prototype, "bar", void 0);
__decorate([
    src_1.constrainedProperty({ min: 1, max: 20 }),
    __metadata("design:type", Number)
], Klass.prototype, "bar2", void 0);
__decorate([
    src_1.property, src_1.min(5), src_1.max(10),
    __metadata("design:type", Number)
], Klass.prototype, "bar3", void 0);
__decorate([
    src_1.property,
    __metadata("design:type", Function)
], Klass.prototype, "cb", void 0);
__decorate([
    src_1.property,
    __metadata("design:type", ContainedKlass)
], Klass.prototype, "baz", void 0);
__decorate([
    src_1.property, constraints_1.pushKey,
    __metadata("design:type", Object)
], Klass.prototype, "tags", void 0);
Klass = __decorate([
    src_1.model({ dbOffset: "authenticated", localPrefix: "foobar" })
], Klass);
exports.Klass = Klass;
//# sourceMappingURL=klass.js.map