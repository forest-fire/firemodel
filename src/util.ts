export function normalized(...args: string[]) {
  return args
    .filter(a => a)
    .map(a => a.replace(/$[\.\/]/, '').replace(/[\.\/]^/, ''))
    .map(a => a.replace(/\./g, '/'))
}

export function slashNotation(...args: string[]) {
  return normalized(...args).join('/');
}

export function dotNotation(...args: string[]) {
  return normalized(...args).join('.').replace('/','.');
}
