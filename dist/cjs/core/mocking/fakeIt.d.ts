import { MockHelper } from "firemock";
import { NamedFakes } from "../../types";
export declare function fakeIt<T = any>(helper: MockHelper, type: keyof typeof NamedFakes, ...rest: any[]): any;
