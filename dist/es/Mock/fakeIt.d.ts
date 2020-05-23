import NamedFakes from "./NamedFakes";
import { MockHelper } from "firemock";
export default function fakeIt<T = any>(helper: MockHelper, type: keyof typeof NamedFakes, ...rest: any[]): any;
