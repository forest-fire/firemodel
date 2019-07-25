import { Model } from "../../../src";
export declare class DynamicPerson extends Model {
    name: string;
    age?: number;
    gender?: "male" | "female" | "other";
}
