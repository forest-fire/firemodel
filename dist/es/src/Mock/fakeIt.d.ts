import { MockHelper } from "firemock";
import { NamedFakes } from "../private";
export declare function fakeIt<T = any>(helper: MockHelper, type: keyof typeof NamedFakes, ...rest: any[]): any;
