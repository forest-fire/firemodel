# Extending Mocks

When you desire a more refined dataset from your mocks you have two levels of control you can exert:

1.  **Named Contexts** -- you can tag properties in your model to a known "type"
2.  **Bespoke Handling** -- you can write your own function for a given property in your model

Let's explore each of these separately.

## Named Contexts

In the auto-mocking section we saw how a property named `name` would be automatically populated with a random name. What if you had a property called `fathersName`? Well that would NOT automatically be given a name but rather just a random string. This is a good example of where _named contexts_ can be leveraged to give the `fathersName` property the same treatment as name.

Here's how we'd do that:

```typescript
export class Person extends Model {
  @property public name: string;
  @property @mock("name") public fathersName: string;
}
```

with this simple addition you've told the mocking engine that the property `fathersName` should be treated as a name. Pretty cool right?

So the obvious next question is ... what named properties are there? Glad you're there keeping me honest. So the answer is:

- name
  - firstName
  - lastName
- company
  - companyName
  - catchPhrase
- address
  - streetName
  - streetAddress
  - city
  - county
  - state
  - stateAbbr
  - zipCode
  - country
  - countryCode
- latitude
- longitude
- gender
- date (alias for `dateRecent`)
  - datePast (or datePastString for `string` return instead of `Date`)
  - dateFuture (or dateFutureString for `string` return instead of `Date`)
  - dateRecent (or dateRecentString for `string` return instead of `Date`)
  - dateSoon (or dateSoonString for `string` return instead of `Date`)
- images
  - avatar
  - imageAnimal
  - imagePerson
  - imageNature
  - imageTransport
- phoneNumber
- lorem
  - word
  - words
  - sentence
  - slug
  - paragraph
  - paragraphs
  - url

All you need to do is choose any of the above and add the `@mock([named tag])` as a modifier to the property. There are a few more named contexts which take additional params:

- **number** - `mock("number", { min: 0, max: 1000, precision: 0 })`
  - allows you to get a number of a any combination of a stated _min_, _max_, or _precision_.
  - if no parameter value is stated then the number will be between 1 and 100
  - if you want a number with two decimal places to the right then you'd set precision to `.01`
- **price** -`mock("price", { min: 10, max: 1000, symbol: "£" })`
  - the `precision` defaults to 2
  - The currency symbol default to "$" but can be set to whatever character you please
  - by default the "cents" component is always 0 but you can set it to a variant amount with `{variableCents}: true}`; when this is set it distributes 40% of values to 0 cents, 30% to 99 cents, and the remaining 30% to a random number
- **random** - `@mock("random", ...arrayOfThings)`
  - using a normal distribution, chooses one of the array items each time
- **sequence** = `@mock("shuffle", ...arrayOfThings)`
  - sequentially applies each array item and then repeats if none are left
- **distribution** = `@mock("distribution", [40, "male"], [50, "female"], [10, "other])`
  - similar to random but it allows you to state the percentage chance of each possible outcome
- **placeImage** - `@mock("placeImage", width, heigh, type)`
  - types are "animals", "architecture", "people", "nature", "people", and "tech". Default type is "any"
- **placeHolder** - `@mock("placeHolder", size, backgroundColor, textColor)`
  - *size* can be a single number like "300" which represents both height and width or it can separate height from width with "300x100"
  - *backgroundColor* and *textColor* are hex values like FFFFFF (white), 0000FF (blue), etc.

## Bespoke Handling

The named contexts should take you a long way but sometimes not to the finish line. In these situations you can drop out of "configuration" and into code:

```typescript
const myBespokeHandler: IMockHelper = (context) => {
  return context.faker...
}

export class Person extends Model {
  @property name: string;
  @property @mock(myBespokeHandler) fathersName: string;
}
```
