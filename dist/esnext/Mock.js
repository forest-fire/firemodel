// tslint:disable-next-line:no-implicit-dependencies
import { RealTimeDB } from "abstracted-firebase";
import { Record } from "./Record";
import { fbKey } from "./index";
import { set } from "lodash";
import { pathJoin } from "./path";
import { getModelMeta } from "./ModelMeta";
import { Parallel } from "wait-in-parallel";
function defaultCardinality(r) {
    return r.META.relationships.reduce((prev, curr) => {
        prev = Object.assign({}, prev, { [curr.property]: true });
    }, {});
}
function dbOffset(record, payload) {
    const output = {};
    const meta = getModelMeta(record);
    const path = pathJoin(meta.dbOffset || "", record.pluralName);
    set(output, path.replace(/\//g, "."), payload);
    return output;
}
function fakeIt(helper, type) {
    switch (type) {
        case "id":
            return fbKey();
        case "String":
            return helper.faker.lorem.words(5);
        case "Number":
            return Math.round(Math.random() * 100);
        case "Boolean":
            return Math.random() > 0.49 ? true : false;
        case "Object":
            return {};
        case "name":
            return helper.faker.name.firstName() + " " + helper.faker.name.lastName();
        case "firstName":
            return helper.faker.name.firstName();
        case "lastName":
            return helper.faker.name.lastName();
        case "company":
            return helper.faker.company.companyName();
        case "address":
            return (helper.faker.address.secondaryAddress() +
                ", " +
                helper.faker.address.city() +
                ", " +
                helper.faker.address.stateAbbr() +
                "  " +
                helper.faker.address.zipCode());
        case "streetName":
            return helper.faker.address.streetName();
        case "streetAddress":
            return helper.faker.address.streetAddress();
        case "city":
            return helper.faker.address.city();
        case "state":
            return helper.faker.address.state();
        case "stateAbbr":
            return helper.faker.address.stateAbbr();
        case "country":
            return helper.faker.address.country();
        case "countryCode":
            return helper.faker.address.countryCode();
        case "latitude":
            return helper.faker.address.latitude();
        case "longitude":
            return helper.faker.address.longitude();
        case "gender":
            return helper.faker.helpers.shuffle(["male", "female", "other"]);
        case "date":
        case "dateRecent":
            return helper.faker.date.recent();
        case "dateMiliseconds":
        case "dateRecentMiliseconds":
            return helper.faker.date.recent().getTime();
        case "datePast":
            return helper.faker.date.past();
        case "datePastMiliseconds":
            return helper.faker.date.past().getTime();
        case "dateFuture":
            return helper.faker.date.future();
        case "dateFutureMiliseconds":
            return helper.faker.date.future().getTime();
        case "dateSoon":
            return helper.faker.date.soon();
        case "dateSoonMiliseconds":
            return helper.faker.date.soon().getTime();
        case "image":
        case "avatar":
            return helper.faker.image.avatar();
        case "imageAnimal":
            return helper.faker.image.animals();
        case "imagePeople":
            return helper.faker.image.people();
        case "imageNature":
            return helper.faker.image.nature();
        case "imageTransport":
            return helper.faker.image.transport();
        case "phoneNumber":
            return helper.faker.phone.phoneNumber();
        default:
            return helper.faker.lorem.slug();
    }
}
function mockValue(db, propMeta) {
    if (!db || !(db instanceof RealTimeDB)) {
        const e = new Error(`When trying to Mock the value of "${propMeta.property}" the database reference passed in not a valid instance of the RealTimeDB provided by either 'abstracted-client' or 'abstracted-server' [ ${typeof db}, ${typeof db === "object" ? db.constructor.name : db} ].`);
        e.name = "FireModel::NotReady";
        throw e;
    }
    const helper = db.mock.getMockHelper();
    const { type, mockType } = propMeta;
    if (mockType) {
        return typeof mockType === "function"
            ? mockType(helper)
            : fakeIt(helper, mockType);
    }
    else {
        const namePatterns = {
            id: "id",
            name: "name",
            fullname: "name",
            firstName: "firstName",
            lastName: "lastName",
            address: "address",
            city: "city",
            state: "stateAbbr",
            country: "countryCode",
            street: "streetAddress",
            streetAddress: "streetAddress",
            lat: "latitude",
            latitude: "latitude",
            lon: "longitude",
            longitude: "longitude",
            avatar: "avatar",
            phone: "phoneNumber",
            phoneNumber: "phoneNumber"
        };
        return fakeIt(helper, Object.keys(namePatterns).includes(propMeta.property)
            ? namePatterns[propMeta.property]
            : type);
    }
}
/** adds mock values for all the properties on a given model */
function mockProperties(db, config, exceptions) {
    return async (instance) => {
        const meta = getModelMeta(instance);
        const props = meta.properties;
        const recProps = {};
        props.map(prop => {
            const p = prop.property;
            recProps[p] = mockValue(db, prop);
        });
        const finalized = Object.assign({}, recProps, exceptions);
        instance = await instance.addAnother(finalized);
        return instance;
    };
}
function NumberBetween(startEnd) {
    return (Math.floor(Math.random() * (startEnd[1] - startEnd[0] + 1)) + startEnd[0]);
}
function addRelationships(db, config, exceptions) {
    return async (instance) => {
        const meta = getModelMeta(instance);
        const relns = meta.relationships;
        const p = new Parallel();
        if (!relns || config.relationshipBehavior === "ignore") {
            return instance;
        }
        const follow = config.relationshipBehavior === "follow";
        relns.map(rel => {
            if (!config.cardinality ||
                Object.keys(config.cardinality).includes(rel.property)) {
                if (rel.relType === "ownedBy") {
                    const id = fbKey();
                    const prop = rel.property;
                    p.add(`ownedBy-${id}`, follow
                        ? instance.setRelationship(prop, id)
                        : db.set(pathJoin(instance.dbPath, prop), id));
                }
                else {
                    const cardinality = config.cardinality
                        ? typeof config.cardinality[rel.property] === "number"
                            ? config.cardinality[rel.property]
                            : NumberBetween(config.cardinality[rel.property])
                        : 2;
                    for (let i = 0; i < cardinality; i++) {
                        const id = fbKey();
                        const prop = rel.property;
                        p.add(`hasMany-${id}`, follow
                            ? instance.addToRelationship(prop, id)
                            : db.set(pathJoin(instance.dbPath, prop, id), true));
                    }
                }
            }
        });
        try {
            await p.isDone();
        }
        catch (e) {
            console.log(JSON.stringify(e));
            throw e;
        }
        instance = await instance.reload();
        return instance;
    };
}
/** adds models to mock DB which were pointed to by original model's FKs */
function followRelationships(db, config, exceptions) {
    return async (instance) => {
        const p = new Parallel();
        const relns = getModelMeta(instance).relationships;
        if (!relns || config.relationshipBehavior !== "follow") {
            return instance;
        }
        const hasMany = relns.filter(i => i.relType === "hasMany");
        const ownedBy = relns.filter(i => i.relType === "ownedBy");
        hasMany.map(r => {
            const fks = Object.keys(instance.get(r.property));
            fks.map(fk => {
                p.add(fk, Mock(r.fkConstructor, db).generate(1, { id: fk }));
            });
        });
        ownedBy.map(r => {
            const fk = instance.get(r.property);
            p.add(fk, Mock(r.fkConstructor, db).generate(1, { id: fk }));
        });
        await p.isDone();
        return instance;
    };
}
export function Mock(modelConstructor, db) {
    const record = Record.create(modelConstructor);
    const config = { relationshipBehavior: "ignore" };
    const API = {
        /**
         * generate
         *
         * Populates the mock database with values for a given model passed in.
         *
         * @param count how many instances of the given Model do you want?
         * @param exceptions do you want to fix a given set of properties to a static value?
         */
        async generate(count, exceptions) {
            const props = mockProperties(db, config, exceptions);
            const relns = addRelationships(db, config, exceptions);
            const follow = followRelationships(db, config, exceptions);
            const p = new Parallel();
            for (let i = 0; i < count; i++) {
                const rec = Record.create(modelConstructor);
                p.add(`record-${i}`, follow(await relns(await props(rec))));
            }
            await p.isDone();
        },
        /**
         * createRelationshipLinks
         *
         * Creates FK links for all the relationships in the model you are generating.
         *
         * @param cardinality an optional param which allows you to have fine grained control over how many of each type of relationship should be added
         */
        createRelationshipLinks(cardinality) {
            config.relationshipBehavior = "link";
            return API;
        },
        /**
         * followRelationshipLinks
         *
         * Creates FK links for all the relationships in the model you are generating; also generates
         * mocks for all the FK links.
         *
         * @param cardinality an optional param which allows you to have fine grained control over how many of each type of relationship should be added
         */
        followRelationshipLinks(cardinality) {
            // TODO: would like to move back to ICardinalityConfig<T> when I can figure out why Partial doesn't work
            config.relationshipBehavior = "follow";
            if (cardinality) {
                config.cardinality = cardinality;
            }
            return API;
        }
    };
    return API;
}
//# sourceMappingURL=Mock.js.map