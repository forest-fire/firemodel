import { Model } from "../../src";
import { IDictionary } from "common-types";
export declare type Callback = (m: string) => boolean;
export declare class SubKlass extends Model {
    sub: string;
}
export declare class ContainedKlass {
    c1?: number;
    c2?: number;
    c3?: number;
}
/** a schema class */
export declare class Klass extends SubKlass {
    foobar: string;
    foo: string;
    bar: number;
    bar2: number;
    bar3: number;
    cb: Callback;
    baz: ContainedKlass;
    tags?: IDictionary<string>;
}
