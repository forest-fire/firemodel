export function reduceHashToRelativePaths(results) {
    const baseParts = Object.keys(results).reduce((acc, curr) => {
        let i = 0;
        while (i < acc.length && curr.split("/")[i] === acc[i]) {
            i++;
        }
    }, results[0].split("/"));
    const root = baseParts.join("/");
    const paths = Object.keys(results).reduce((acc, key) => {
        acc = acc.concat({
            path: key.replace(root, ""),
            value: results[key]
        });
        return acc;
    }, []);
    return {
        paths,
        root,
        fullPathNames: Object.keys(results)
    };
}
//# sourceMappingURL=reduceHashToRelativePaths.js.map