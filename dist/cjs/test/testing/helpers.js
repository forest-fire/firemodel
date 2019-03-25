"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const fs = __importStar(require("fs"));
const yaml = __importStar(require("js-yaml"));
const process = __importStar(require("process"));
require("./test-console"); // TS declaration
const test_console_1 = require("test-console");
function restoreStdoutAndStderr() {
    console._restored = true;
}
exports.restoreStdoutAndStderr = restoreStdoutAndStderr;
async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.wait = wait;
async function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.timeout = timeout;
let envIsSetup = false;
function setupEnv() {
    if (!envIsSetup) {
        if (!process.env.AWS_STAGE) {
            process.env.AWS_STAGE = "test";
        }
        const current = process.env;
        const yamlConfig = yaml.safeLoad(fs.readFileSync("./env.yml", "utf8"));
        const combined = Object.assign({}, yamlConfig[process.env.AWS_STAGE], process.env);
        console.log(`Loading ENV for "${process.env.AWS_STAGE}"`);
        Object.keys(combined).forEach(key => (process.env[key] = combined[key]));
        envIsSetup = true;
        return combined;
    }
}
exports.setupEnv = setupEnv;
function ignoreStdout() {
    const rStdout = test_console_1.stdout.ignore();
    const restore = () => {
        rStdout();
        console._restored = true;
    };
    return restore;
}
exports.ignoreStdout = ignoreStdout;
function captureStdout() {
    const rStdout = test_console_1.stdout.inspect();
    const restore = () => {
        rStdout.restore();
        console._restored = true;
        return rStdout.output;
    };
    return restore;
}
exports.captureStdout = captureStdout;
function captureStderr() {
    const rStderr = test_console_1.stderr.inspect();
    const restore = () => {
        rStderr.restore();
        console._restored = true;
        return rStderr.output;
    };
    return restore;
}
exports.captureStderr = captureStderr;
function ignoreStderr() {
    const rStdErr = test_console_1.stderr.ignore();
    const restore = () => {
        rStdErr();
        console._restored = true;
    };
    return restore;
}
exports.ignoreStderr = ignoreStderr;
function ignoreBoth() {
    const rStdOut = test_console_1.stdout.ignore();
    const rStdErr = test_console_1.stderr.ignore();
    const restore = () => {
        rStdOut();
        rStdErr();
        console._restored = true;
    };
    return restore;
}
exports.ignoreBoth = ignoreBoth;
/**
 * The first key in a Hash/Dictionary
 */
function firstKey(dictionary) {
    return lodash_1.first(Object.keys(dictionary));
}
exports.firstKey = firstKey;
/**
 * The first record in a Hash/Dictionary of records
 */
function firstRecord(dictionary) {
    return dictionary[this.firstKey(dictionary)];
}
exports.firstRecord = firstRecord;
/**
 * The last key in a Hash/Dictionary
 */
function lastKey(listOf) {
    return lodash_1.last(Object.keys(listOf));
}
exports.lastKey = lastKey;
/**
 * The last record in a Hash/Dictionary of records
 */
function lastRecord(dictionary) {
    return dictionary[this.lastKey(dictionary)];
}
exports.lastRecord = lastRecord;
function valuesOf(listOf, property) {
    const keys = Object.keys(listOf);
    return keys.map((key) => {
        const item = listOf[key];
        return item[property];
    });
}
exports.valuesOf = valuesOf;
function length(listOf) {
    return listOf ? Object.keys(listOf).length : 0;
}
exports.length = length;
//# sourceMappingURL=helpers.js.map