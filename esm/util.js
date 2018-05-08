export function normalized(...args) {
    return args
        .filter(a => a)
        .map(a => a.replace(/$[\.\/]/, "").replace(/[\.\/]^/, ""))
        .map(a => a.replace(/\./g, "/"));
}
export function slashNotation(...args) {
    return normalized(...args).join("/");
}
export function dotNotation(...args) {
    return normalized(...args)
        .join(".")
        .replace("/", ".");
}
