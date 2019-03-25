import { Model, fk } from "../../src";
import { IDictionary } from "common-types";
export declare class Person extends Model {
    name: string;
    age?: number;
    gender?: "male" | "female" | "other";
    scratchpad?: IDictionary;
    tags?: IDictionary<string>;
    mother?: fk;
    father?: fk;
    parents?: IDictionary;
    concerts?: IDictionary;
    employerId?: fk;
}
