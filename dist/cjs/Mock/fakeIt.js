"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const date_fns_1 = require("date-fns");
const sequence = {};
function getDistribution(...distribution) {
    const num = Math.floor(Math.random() * 100) + 1;
    let start = 1;
    let outcome;
    const d = distribution.map(i => {
        const [percentage, value] = i;
        const end = start + percentage - 1;
        const val = { start, end, value };
        start = start + percentage;
        return val;
    });
    d.forEach(i => {
        if (num >= i.start && num <= i.end) {
            outcome = i.value;
            // console.log("set", num, `${start} => ${start + percentage}`);
        }
    });
    if (!outcome) {
        throw new Error(`The mock distribution's random number [ ${num} ] fell outside the range of probability; make sure that your percentages add up to 100 [ ${distribution
            .map(i => i[0])
            .join(", ")} ]`);
    }
    return outcome;
}
function fakeIt(helper, type, ...rest) {
    function getNumber(numOptions) {
        return numOptions && typeof numOptions === "object"
            ? helper.faker.random.number(numOptions)
            : helper.faker.random.number({ min: 1, max: 100 });
    }
    /** for mocks which use a hash-based second param */
    function options(defaultValue = {}) {
        return rest[0] ? Object.assign({}, defaultValue, rest[0]) : undefined;
    }
    switch (type) {
        case "id":
            return index_1.fbKey();
        case "String":
            return helper.faker.lorem.words(5);
        case "number":
        case "Number":
            return getNumber(options({ min: 0, max: 1000 }));
        case "price":
            const price = options({
                symbol: "$",
                min: 1,
                max: 100,
                precision: 2,
                variableCents: false
            });
            let cents;
            if (price.variableCents) {
                cents = getDistribution([40, "00"], [30, "99"], [30, String(getNumber({ min: 1, max: 98 }))]);
                if (cents.length === 1) {
                    cents = cents + "0";
                }
            }
            const priceAmt = helper.faker.commerce.price(price.min, price.max, price.precision, price.symbol);
            return price.variableCents
                ? priceAmt.replace(".00", "." + cents)
                : priceAmt;
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
            return helper.faker.address.streetAddress(false);
        case "fullAddress":
            return helper.faker.address.streetAddress(true);
        case "city":
            return helper.faker.address.city();
        case "state":
            return helper.faker.address.state();
        case "zipCode":
            return helper.faker.address.zipCode();
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
        case "coordinate":
            return {
                latitude: helper.faker.address.latitude(),
                longitude: helper.faker.address.longitude()
            };
        /**
         * Adds a gender of "male", "female" or "other" but with more likelihood of
         * male or female.
         */
        case "gender":
            return helper.faker.helpers.shuffle([
                "male",
                "female",
                "male",
                "female",
                "male",
                "female",
                "other"
            ]);
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
        case "dateRecentString":
            return date_fns_1.format(helper.faker.date.recent(), "YYYY-MM-DD");
        case "dateMiliseconds":
        case "dateRecentMiliseconds":
            return helper.faker.date.recent().getTime();
        case "datePast":
            return helper.faker.date.past();
        case "datePastString":
            return date_fns_1.format(helper.faker.date.past(), "YYYY-MM-DD");
        case "datePastMiliseconds":
            return helper.faker.date.past().getTime();
        case "dateFuture":
            return helper.faker.date.future();
        /** returns string based date in format of "YYYY-MM-DD" */
        case "dateFutureString":
            return date_fns_1.format(helper.faker.date.future(), "YYYY-MM-DD");
        case "dateFutureMiliseconds":
            return helper.faker.date.future().getTime();
        case "dateSoon":
            return helper.faker.date.soon();
        case "dateSoonString":
            return date_fns_1.format(helper.faker.date.soon(), "YYYY-MM-DD");
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
            return helper.faker.random.arrayElement(rest);
        case "distribution":
            return getDistribution(...rest);
        case "sequence":
            const prop = helper.context.property;
            const items = rest;
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
            const [width, height, imgType] = rest;
            return `https://placeimg.com/${width}/${height}/${imgType ? imgType : "all"}`;
        case "placeHolder":
            const [size, backgroundColor, textColor] = rest;
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