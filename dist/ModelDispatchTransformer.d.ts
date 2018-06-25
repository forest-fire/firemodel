import { IReduxDispatch } from "./VuexWrapper";
import { IDictionary } from "../node_modules/common-types/dist";
import { IFirebaseWatchEvent } from "../node_modules/abstracted-firebase/dist";
/**
 * Contextualizes dispatches from abstracted-firebase into Model aware messages
 */
export declare const ModelDispatchTransformer: (fireModelContext: IDictionary<any>) => (clientHandler: IReduxDispatch) => (event: IFirebaseWatchEvent) => void;
