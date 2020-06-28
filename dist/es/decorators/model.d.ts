import "reflect-metadata";
import { FmModelConstructor, IFmModelMeta, IModel } from "../types";
export declare function model(options?: Partial<IFmModelMeta>): <T extends IModel>(target: FmModelConstructor<T>) => FmModelConstructor<T>;
