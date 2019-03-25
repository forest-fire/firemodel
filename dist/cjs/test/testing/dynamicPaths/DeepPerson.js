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
var DeepPerson_1;
const src_1 = require("../../../src");
const Hobby_1 = __importDefault(require("./Hobby"));
const Company_1 = __importDefault(require("./Company"));
const Location_1 = __importDefault(require("./Location"));
const HumanAttribute_1 = require("./HumanAttribute");
const School_1 = __importDefault(require("./School"));
const Car_1 = __importDefault(require("./Car"));
let DeepPerson = DeepPerson_1 = class DeepPerson extends src_1.Model {
};
__decorate([
    src_1.property,
    __metadata("design:type", Object)
], DeepPerson.prototype, "name", void 0);
__decorate([
    src_1.property,
    __metadata("design:type", Number)
], DeepPerson.prototype, "age", void 0);
__decorate([
    src_1.property, src_1.mock("random", "The Dude", "Jackass", "Boomer", "Buster"),
    __metadata("design:type", String)
], DeepPerson.prototype, "nickname", void 0);
__decorate([
    src_1.property, src_1.mock("random", "CT", "MA", "CA"),
    __metadata("design:type", String)
], DeepPerson.prototype, "group", void 0);
__decorate([
    src_1.property, src_1.mock("placeImage", 640, 480),
    __metadata("design:type", String)
], DeepPerson.prototype, "photo", void 0);
__decorate([
    src_1.property, src_1.mock("phoneNumber"),
    __metadata("design:type", String)
], DeepPerson.prototype, "phoneNumber", void 0);
__decorate([
    src_1.hasOne(() => School_1.default, "students"),
    __metadata("design:type", String)
], DeepPerson.prototype, "school", void 0);
__decorate([
    src_1.hasOne(() => Location_1.default, "residents"),
    __metadata("design:type", String)
], DeepPerson.prototype, "home", void 0);
__decorate([
    src_1.hasOne(() => Company_1.default, "employees"),
    __metadata("design:type", String)
], DeepPerson.prototype, "employer", void 0);
__decorate([
    src_1.hasMany(() => Hobby_1.default, "practitioners"),
    __metadata("design:type", Object)
], DeepPerson.prototype, "hobbies", void 0);
__decorate([
    src_1.hasMany(() => Car_1.default, "owners"),
    __metadata("design:type", Object)
], DeepPerson.prototype, "cars", void 0);
__decorate([
    src_1.hasMany(() => DeepPerson_1, "children"),
    __metadata("design:type", Object)
], DeepPerson.prototype, "parents", void 0);
__decorate([
    src_1.hasMany(() => DeepPerson_1, "parents"),
    __metadata("design:type", Object)
], DeepPerson.prototype, "children", void 0);
__decorate([
    src_1.hasMany(() => HumanAttribute_1.HumanAttribute),
    __metadata("design:type", Object)
], DeepPerson.prototype, "attributes", void 0);
DeepPerson = DeepPerson_1 = __decorate([
    src_1.model({ dbOffset: ":group/testing" })
], DeepPerson);
exports.default = DeepPerson;
//# sourceMappingURL=DeepPerson.js.map