import { Model } from "../../../src";
export declare class Person extends Model {
    name: string;
    age?: number;
    gender?: "male" | "female" | "other";
}
