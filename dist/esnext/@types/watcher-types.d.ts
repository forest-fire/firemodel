import { ISerializedQueryIdentity } from "serialized-query";
export interface IWatcherResult {
    watchId: string;
    localPath: string;
    query: ISerializedQueryIdentity;
}
