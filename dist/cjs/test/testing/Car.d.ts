import { Model, fk } from "../../src";
export declare class Car extends Model {
    model: string;
    cost: number;
    modelYear: number;
    owner?: fk;
}
