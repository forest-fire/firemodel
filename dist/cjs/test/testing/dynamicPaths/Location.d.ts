import { Model, fks } from "../../../src";
export default class Location extends Model {
    name: string;
    state: string;
    longitude: number;
    latitude: number;
    residents: fks;
}
