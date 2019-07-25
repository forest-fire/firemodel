import { Model, fks } from "../../src";
export declare class Company extends Model {
    name: string;
    founded?: string;
    employees?: fks;
}
