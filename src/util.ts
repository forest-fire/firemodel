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
  code: string;
  details: any[];
}

export function createError(
  code: string,
  message: string,
  details: any[] = []
) {
  const err = new Error() as IExtendedError;
  err.code = code;
  err.message = message;
  err.details = details;

  return err;
}
