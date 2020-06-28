import { IModel } from "../@types/index";
export declare function getAllPropertiesFromClassStructure<T extends IModel>(model: T): ("id" | "lastUpdated" | "createdAt" | "META")[];
