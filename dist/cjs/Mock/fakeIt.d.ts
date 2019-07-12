import { MockHelper } from "firemock";
import NamedFakes from "./NamedFakes";
export default function fakeIt<T = any>(helper: MockHelper, type: keyof typeof NamedFakes, ...rest: any[]): any;
