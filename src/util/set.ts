import { FmUtilityError } from "@/errors";
import { IDictionary } from "common-types";

/**
 * Sets a value at a nested point within base object passed in. This is meant as a
 * replacement to use of `lodash.set()`.
 *
 * @param obj the base object which is being mutated
 * @param dotPath the path into the object where the mutation will take place, delimited by `.`
 * @param value The value to set at the _dotPath_
 * @param createIfNonExistant by default, if the path to the object does not exist then an error is thrown but if you want you can state the desire to have the full path created
 */
export function set(
  obj: IDictionary,
  dotPath: string,
  value: any,
  createIfNonExistant: boolean = true
) {
  if (!dotPath) {
    throw new FmUtilityError(
      `Attempt to set value into a dotPath but the dotPath was empty!`,
      "not-allowed"
    );
  }
  const parts = dotPath.split(/\??\./);
  const allButLast = parts.slice(0, parts.length - 1);
  const key = parts.pop();
  let ref = obj;

  // iterate the ref to the leaf node
  allButLast.forEach((p) => {
    if (!ref[p]) {
      if (createIfNonExistant) {
        ref[p as keyof typeof ref] = {};
      } else {
        throw new FmUtilityError(
          `The dotPath -- ${dotPath} -- does not exist in the passed in object. You must either expressly state that you want the object structure created or this a real error that must be addressed otherwise. The part of the path which this failed on was "${p}".`
        );
      }
    } else if (typeof ref[p] !== "object") {
      throw new FmUtilityError(
        `Failed to set the path of "${dotPath}" of the passed in base object because the base object had a scalar value along that path and setting this would have changed the object's data structure in way which is not allowed! The scalar value was found in the "${p}" component of the path.`
      );
    }

    ref = ref[p];
  });

  ref[key as keyof typeof ref] = value;
}
