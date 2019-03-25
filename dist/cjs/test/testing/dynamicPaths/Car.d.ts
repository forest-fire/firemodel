import { Model, fks } from "../../../src";
export default class Car extends Model {
    name: string;
    vendor: string;
    model: string;
    year: string;
    owners: fks;
}
