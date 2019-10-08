export default async function cleanPredecessor(db, predecessors) {
    let empty = false;
    let index = 1;
    while (!empty || index > predecessors.length) {
        const path = predecessors.slice(0, index).join("/");
        const result = await db.getValue(path);
        console.log(path);
        if (!result || Object.keys(result).length === 0) {
            await db.remove(path);
            empty = true;
        }
        index++;
    }
}
//# sourceMappingURL=cleanPredecessor.js.map