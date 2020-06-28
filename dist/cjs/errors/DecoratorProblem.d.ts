import { FireModelError } from "./";
import { IDictionary } from "common-types";
export declare class DecoratorProblem extends FireModelError {
    constructor(decorator: string, e: Error | string, context?: IDictionary);
}
