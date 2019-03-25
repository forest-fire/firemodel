import { Model, IFmHasOne } from "../../src";
export declare class Pay extends Model {
    employee?: IFmHasOne;
    amount?: string;
}
