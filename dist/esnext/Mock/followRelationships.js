import { Mock } from "../Mock";
import { Parallel } from "wait-in-parallel";
import { getModelMeta } from "../ModelMeta";
/** adds models to mock DB which were pointed to by original model's FKs */
export default function followRelationships(db, config, exceptions = {}) {
    return async (instance) => {
        const p = new Parallel();
        try {
            const relns = getModelMeta(instance).relationships;
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
                    Mock(r.fkConstructor(), db).generate(1, { id: fk }));
                });
            });
            hasOne.map(r => {
                const fk = instance.get(r.property);
                p.add(fk, 
                // Mock(r.fkConstructor(), db).generate(1, props(fk, r.fkConstructor()))
                Mock(r.fkConstructor(), db).generate(1, { id: fk }));
            });
            const results = await p.isDone();
        }
        catch (e) {
            throw e;
        }
        return instance;
    };
}
//# sourceMappingURL=followRelationships.js.map