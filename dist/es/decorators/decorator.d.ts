import "reflect-metadata";
import { IDictionary } from "common-types";
import { Model } from "@/private";
export declare const propertyDecorator: <T extends Model>(nameValuePairs?: IDictionary, property?: string) => (target: Model, key: string) => void;
export declare function getPushKeys(target: object): ("id" | "lastUpdated" | "createdAt" | "META")[];
