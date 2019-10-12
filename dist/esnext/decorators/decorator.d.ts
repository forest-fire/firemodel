import "reflect-metadata";
import { Model } from "../Model";
import { IDictionary } from "common-types";
export declare const propertyDecorator: <T extends Model>(nameValuePairs?: IDictionary<any>, property?: string) => (target: Model, key: string) => void;
export declare function getPushKeys(target: object): ("id" | "lastUpdated" | "createdAt" | "META")[];
