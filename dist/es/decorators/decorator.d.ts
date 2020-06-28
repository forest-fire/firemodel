import "reflect-metadata";
import { IModel } from "../@types/index";
import { IDictionary } from "common-types";
export declare const propertyDecorator: <T extends IModel>(nameValuePairs?: IDictionary, property?: string) => (target: IModel, key: string) => void;
