import { IReduxDispatch } from "./VuexWrapper";
import { IDictionary } from "common-types";
import { IFirebaseWatchEvent } from "abstracted-firebase";
/**
 * Contextualizes dispatches from abstracted-firebase into Model aware messages
 */
export declare const ModelDispatchTransformer: (fireModelContext: IDictionary<any>) => (clientHandler: IReduxDispatch) => (event: IFirebaseWatchEvent) => void;
