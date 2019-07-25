import { Model, fk, fks } from "../../src";
import { IDictionary } from "common-types";
export declare class PersonWithLocal extends Model {
    name: string;
    age?: number;
    gender?: "male" | "female" | "other";
    scratchpad?: IDictionary;
    tags?: IDictionary<string>;
    mother?: fk;
    father?: fk;
    children?: fks;
    concerts?: fk;
    company?: fk;
    pays?: fks;
}
