import { getProperties } from "./index";

export function getPushKeys(target: object) {
  const props = getProperties(target);
  return props.filter((p) => p.pushKey).map((p) => p.property);
}
