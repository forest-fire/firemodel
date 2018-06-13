import { Record } from "./Record";
function defaultCardinality(r) {
    return r.META.relationships.reduce((prev, curr) => {
        prev = Object.assign({}, prev, { [curr.property]: true });
    }, {});
}
function properties(record, config, exceptions) {
    return () => {
        return;
    };
}
function addRelationships(record, config, exceptions) {
    return () => {
        return;
    };
}
function followRelationships(record, config, exceptions) {
    return (prop) => {
        return;
    };
}
export async function Mock(modelConstructor, db) {
    const record = Record.create(modelConstructor);
    const config = { relationshipBehavior: "ignore" };
    await db.waitForConnection();
    const API = {
        generate(count, exceptions) {
            const follow = followRelationships(record, config, exceptions);
            const relns = addRelationships(record, config, exceptions);
            const props = properties(record, config, exceptions);
            const records = [];
            for (let i = 0; i < count; i++) {
                records.push(follow(relns(props(exceptions))));
            }
            // db.mock.updateDB(
        },
        createRelationshipLinks(cardinality) {
            config.relationshipBehavior = "link";
            config.cardinality = cardinality ? cardinality : defaultCardinality(record);
            return API;
        },
        followRelationshipLinks(cardinality) {
            config.relationshipBehavior = "follow";
            config.cardinality = cardinality ? cardinality : defaultCardinality(record);
            return API;
        }
    };
    return API;
}
//# sourceMappingURL=Mock.js.map