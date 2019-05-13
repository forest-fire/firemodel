export function expandFkStringToCompositeNotation(fkRef, dynamicComponents = []) {
    if (fkRef.indexOf("::") === -1) {
        return Object.assign({ id: fkRef }, dynamicComponents.reduce((prev, curr) => {
            if (curr === "id") {
                return prev;
            }
            return Object.assign({}, prev, { [curr]: rec.data[curr] });
        }, {}));
    }
    const id = fkRef.slice(0, fkRef.indexOf("::"));
    const remaining = fkRef
        .slice(fkRef.indexOf("::"))
        .split("::")
        .filter(i => i)
        .reduce((prev, curr) => {
        const [name, value] = curr.split(":");
        return Object.assign({}, prev, { [name]: value });
    }, {});
    return Object.assign({ id }, remaining);
}
//# sourceMappingURL=expandFkStringToCompositeNotation.js.map