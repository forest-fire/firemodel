import { IModel } from "../types";
export declare function getAllPropertiesFromClassStructure<T extends IModel>(model: T): ("id" | "lastUpdated" | "createdAt" | "META")[];
