import { fk, Model } from "../../src";
export declare class Company extends Model {
    name: string;
    founded?: string;
    employees?: fk[];
}
