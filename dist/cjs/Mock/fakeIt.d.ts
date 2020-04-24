import NamedFakes from "./NamedFakes";
import { MockHelper } from "abstracted-firebase";
export default function fakeIt<T = any>(helper: MockHelper, type: keyof typeof NamedFakes, ...rest: any[]): any;
