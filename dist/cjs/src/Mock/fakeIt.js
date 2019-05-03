"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const sequence = {};
function fakeIt(helper, type, ...rest) {
    switch (type) {
        case "id":
            return index_1.fbKey();
        case "String":
            return helper.faker.lorem.words(5);
        case "number":
        case "Number":
            const options = Array.isArray(rest[0]) ? rest[0][0] : undefined;
            return options && typeof options === "object"
                ? helper.faker.random.number(options)
                : helper.faker.random.number({ min: 1, max: 100 });
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
        case "companyName":
            return helper.faker.company.companyName();
        case "address":
            return (helper.faker.address.secondaryAddress() +
                ", " +
                helper.faker.address.city() +
                ", " +
                helper.faker.address.stateAbbr() +
                "  " +
                helper.faker.address.zipCode());
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
        case "age":
            return helper.faker.random.number({ min: 1, max: 99 });
        case "ageChild":
            return helper.faker.random.number({ min: 1, max: 10 });
        case "ageAdult":
            return helper.faker.random.number({ min: 21, max: 99 });
        case "ageOlder":
            return helper.faker.random.number({ min: 60, max: 99 });
        case "jobTitle":
            return helper.faker.name.jobTitle;
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
        case "imageAvatar":
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
        case "email":
            return helper.faker.internet.email;
        case "word":
            return helper.faker.lorem.word();
        case "words":
            return helper.faker.lorem.words();
        case "sentence":
            return helper.faker.lorem.sentence();
        case "slug":
            return helper.faker.lorem.slug();
        case "paragraph":
            return helper.faker.lorem.paragraph();
        case "paragraphs":
            return helper.faker.lorem.paragraphs();
        case "url":
            return helper.faker.internet.url();
        case "uuid":
            return helper.faker.random.uuid();
        case "random":
            return helper.faker.random.arrayElement(rest[0]);
        case "sequence":
            const prop = helper.context.property;
            const items = rest[0];
            if (typeof sequence[prop] === "undefined") {
                sequence[prop] = 0;
            }
            else {
                if (sequence[prop] >= items.length - 1) {
                    sequence[prop] = 0;
                }
                else {
                    sequence[prop]++;
                }
            }
            return items[sequence[prop]];
        case "placeImage":
            // TODO: determine why data structure is an array of arrays
            const [width, height, imgType] = rest[0];
            return `https://placeimg.com/${width}/${height}/${imgType ? imgType : "all"}`;
        case "placeHolder":
            const [size, backgroundColor, textColor] = rest[0];
            let url = `https://via.placeholder.com/${size}`;
            if (backgroundColor) {
                url += `/${backgroundColor}`;
                if (textColor) {
                    url += `/${textColor}`;
                }
            }
            return url;
        default:
            return helper.faker.lorem.slug();
    }
}
exports.default = fakeIt;
//# sourceMappingURL=fakeIt.js.map