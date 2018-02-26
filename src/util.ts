export function normalized(...args: string[]) {
  return args
    .filter(a => a)
    .map(a => a.replace(/$[\.\/]/, "").replace(/[\.\/]^/, ""))
    .map(a => a.replace(/\./g, "/"));
}

export function slashNotation(...args: string[]) {
  return normalized(...args).join("/");
}

export function dotNotation(...args: string[]) {
  return normalized(...args)
    .join(".")
    .replace("/", ".");
}

export interface IExtendedError extends Error {
  underlying: any;
  code: string;
  details: any[];
}

export function createError(
  /** original error */
  underlying: any,
  /** short code describing error */
  code: string,
  /** textual description of error */
  message: string,
  details: any[] = []
) {
  const err = new Error() as IExtendedError;
  err.underlying = underlying;
  err.code = code;
  err.message = message;
  err.details = details;

  return err;
}
