import {
  OldOldModel,
  Model,
  property,
  constrainedProperty,
  constrain,
  desc,
  min,
  max,
  length,
  schema
} from "../../src/index";
import { IDictionary } from "common-types";
import { pushKey } from "../../src/decorators/property";

/* tslint:disable:max-classes-per-file */
export type Callback = (m: string) => boolean;

export class SubKlass extends Model {
  @property public sub: string = "subklass";
}

export class ContainedKlass {
  public c1?: number = 1;
  public c2?: number = 1;
  public c3?: number = 1;
}

/** a schema class */
@schema({ dbOffset: "authenticated", localOffset: "foobar" })
export class Klass extends SubKlass {
  @desc("who doesn't love a foobar?")
  @property
  @length(15)
  public foobar: string;
  @property public foo: string;
  @desc("the bar is a numeric property that holds no real meaning")
  @property
  @constrain("min", 2)
  public bar: number = 8;
  @constrainedProperty({ min: 1, max: 20 })
  public bar2: number = 12;
  // prettier-ignore
  @property @min(5) @max(10) public bar3: number;
  @property public cb: Callback;
  @property public baz: ContainedKlass;
  // prettier-ignore
  @property @pushKey public tags?: IDictionary<string>;
}
