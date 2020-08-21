import { IListOptions, IListQueryOptions } from "@/types";
import { FireModel } from "../FireModel";

/**
 * List.query() has a naturally more limited scope of options
 * than most of the List.xxx query operations. This function
 * narrows the options that these query shorthands have received
 * to just those options which are
 */
export function reduceOptionsForQuery<T>(
  o: IListOptions<T>
): IListQueryOptions<T> {
  return {
    db: o.db || FireModel.defaultDb,
    logger: o.logger,
    offsets: o.offsets,
    paginate: o.paginate,
  };
}
