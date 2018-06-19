import { Record } from "./Record";
import { arrayToHash } from "typed-conversions";
import { fbKey } from "./index";
import { set } from "lodash";
// tslint:disable-next-line:no-var-requires
const pathJoin = require("path.join");
function defaultCardinality(r) {
    return r.META.relationships.reduce((prev, curr) => {
        prev = Object.assign({}, prev, { [curr.property]: true });
    }, {});
}
function dbOffset(record, payload) {
    const output = {};
    const path = pathJoin(record.META.dbOffset || "", record.pluralName);
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
function properties(db, config, exceptions) {
    return (instance) => {
        if (!instance.META) {
            const e = new Error(`The instance passed passed into properties does not have any META properties! [ ${typeof instance} ]`);
            e.name = "FireModel::MockError";
            throw e;
        }
        const props = instance.META.properties;
        props.map(prop => {
            instance[prop.property] = mockValue(db, prop);
        });
        return instance;
    };
}
function NumberBetween(startEnd) {
    return (Math.floor(Math.random() * (startEnd[1] - startEnd[0] + 1)) + startEnd[0]);
}
function addRelationships(db, config, exceptions) {
    return (instance) => {
        const relns = instance.META.relationships;
        if (!relns || config.relationshipBehavior === "ignore") {
            return instance;
        }
        relns.map(rel => {
            if (!config.cardinality ||
                Object.keys(config.cardinality).includes(rel.property)) {
                if (rel.relType === "ownedBy") {
                    instance[rel.property] = fbKey();
                }
                else {
                    const cardinality = config.cardinality
                        ? typeof config.cardinality[rel.property] === "number"
                            ? config.cardinality[rel.property]
                            : NumberBetween(config.cardinality[rel.property])
                        : 2;
                    instance[rel.property] = [];
                    for (let i = 0; i < cardinality; i++) {
                        instance[rel.property].push(fbKey());
                    }
                }
            }
        });
        return instance;
    };
}
function followRelationships(db, config, exceptions) {
    return (instance) => {
        const relns = instance.META.relationships;
        if (!relns || config.relationshipBehavior !== "follow") {
            return instance;
        }
        instance = addRelationships(db, config, exceptions)(instance);
        relns.map(rel => {
            const fkConstructor = rel.fkConstructor;
            let foreignModel = new fkConstructor();
            const fks = getRelationshipIds(instance, rel);
            fks.map(fk => {
                foreignModel = properties(db, { relationshipBehavior: "link" }, {})(foreignModel);
                foreignModel.id = fk;
                if (rel.inverse) {
                    const inverseType = foreignModel.META.property(rel.inverse).relType;
                    if (inverseType === "hasMany") {
                        // TODO: look at after implementing relationship mgmt
                    }
                }
                Record.add(fkConstructor, foreignModel);
            });
        });
        return instance;
    };
}
function getRelationshipIds(instance, rel) {
    if (rel.relType === "ownedBy") {
        return [instance[rel.property]];
    }
    else {
        return instance[rel.property];
    }
}
export function Mock(modelConstructor, db) {
    const record = Record.create(modelConstructor);
    const config = { relationshipBehavior: "ignore" };
    const API = {
        generate(count, exceptions) {
            const props = properties(db, config, exceptions);
            const relns = addRelationships(db, config, exceptions);
            const follow = followRelationships(db, config, exceptions);
            const records = [];
            for (let i = 0; i < count; i++) {
                const model = new modelConstructor();
                records.push(follow(relns(props(model))));
            }
            db.mock.updateDB(dbOffset(record, arrayToHash(records)));
        },
        createRelationshipLinks(cardinality) {
            config.relationshipBehavior = "link";
            return API;
        },
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