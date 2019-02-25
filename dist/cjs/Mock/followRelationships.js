"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mock_1 = require("../Mock");
const wait_in_parallel_1 = require("wait-in-parallel");
const ModelMeta_1 = require("../ModelMeta");
/** adds models to mock DB which were pointed to by original model's FKs */
function followRelationships(db, config, exceptions = {}) {
    return async (instance) => {
        const p = new wait_in_parallel_1.Parallel();
        try {
            const relns = ModelMeta_1.getModelMeta(instance).relationships;
            if (!relns || config.relationshipBehavior !== "follow") {
                return instance;
            }
            const hasMany = relns.filter(i => i.relType === "hasMany");
            const hasOne = relns.filter(i => i.relType === "hasOne");
            // const props = (fk: string, cons: new () => any) =>
            //   instance.isSameModelAs(cons)
            //     ? instance.hasDynamicPath
            //       ? { ...(instance.compositeKey as ICompositeKey), ...{ id: fk } }
            //       : { id: fk }
            //     : { id: fk };
            hasMany.map(r => {
                const fks = Object.keys(instance.get(r.property));
                fks.map(fk => {
                    p.add(fk, 
                    // Mock(r.fkConstructor(), db).generate(1, props(fk, r.fkConstructor()))
                    Mock_1.Mock(r.fkConstructor(), db).generate(1, { id: fk }));
                });
            });
            hasOne.map(r => {
                const fk = instance.get(r.property);
                p.add(fk, 
                // Mock(r.fkConstructor(), db).generate(1, props(fk, r.fkConstructor()))
                Mock_1.Mock(r.fkConstructor(), db).generate(1, { id: fk }));
            });
            const results = await p.isDone();
        }
        catch (e) {
            throw e;
        }
        return instance;
    };
}
exports.default = followRelationships;
//# sourceMappingURL=followRelationships.js.map