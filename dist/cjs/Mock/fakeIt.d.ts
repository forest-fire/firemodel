import NamedFakes from "./NamedFakes";
export default function fakeIt<T = any>(helper: import("firemock").MockHelper, type: keyof typeof NamedFakes, ...rest: any[]): any;
