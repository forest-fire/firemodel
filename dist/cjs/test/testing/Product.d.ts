import { Model } from "../../src";
export declare class Product extends Model {
    name: string;
    category: string;
    minCost?: number;
    isInStock: boolean;
}
