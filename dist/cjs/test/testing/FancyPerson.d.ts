import { Model, fk, fks } from "../../src";
export declare class FancyPerson extends Model {
    name: string;
    age?: number;
    phoneNumber?: string;
    otherPhone?: string;
    foobar?: string;
    employer?: fk;
    cars?: fks;
    parents?: fks;
    children?: fks;
}
