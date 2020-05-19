"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
}
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./decorators/index"), exports);
var index_1 = require("./models/index");
Object.defineProperty(exports, "Model", { enumerable: true, get: function () { return index_1.Model; } });
Object.defineProperty(exports, "AuditLog", { enumerable: true, get: function () { return index_1.AuditLog; } });
__exportStar(require("./Record"), exports);
__exportStar(require("./record/relationships/modelRegistration"), exports);
var List_1 = require("./List");
Object.defineProperty(exports, "List", { enumerable: true, get: function () { return List_1.List; } });
var Mock_1 = require("./Mock");
Object.defineProperty(exports, "Mock", { enumerable: true, get: function () { return Mock_1.Mock; } });
var FireModel_1 = require("./FireModel");
Object.defineProperty(exports, "FireModel", { enumerable: true, get: function () { return FireModel_1.FireModel; } });
var Watch_1 = require("./Watch");
Object.defineProperty(exports, "Watch", { enumerable: true, get: function () { return Watch_1.Watch; } });
__exportStar(require("./watchers/types"), exports);
__exportStar(require("./state-mgmt/index"), exports);
__exportStar(require("./@types/index"), exports);
var path_1 = require("./path");
Object.defineProperty(exports, "pathJoin", { enumerable: true, get: function () { return path_1.pathJoin; } });
__exportStar(require("./Mock/types"), exports);
var firebase_key_1 = require("firebase-key");
Object.defineProperty(exports, "fbKey", { enumerable: true, get: function () { return firebase_key_1.key; } });
__exportStar(require("./record/createCompositeKey"), exports);
__exportStar(require("./dexie/index"), exports);
//# sourceMappingURL=index.js.map