# Extending Mocks

When you desire a more refined dataset from your mocks you have two levels of control you can exert:

1.  **Named Contexts** -- you can tag properties in your model to a known "type"
2.  **Bespoke Handling** -- you can write your own function for a given property in your model

Let's explore each of these separately.

## Named Contexts

In the auto-mocking section we saw how a property named `name` would be automatically populated with a random name. What if you had a property called `fathersName`? Well that would NOT automatically be given a name but rather just a random string. This is a good example of where _named contexts_ can be leveraged to give the `fathersName` property the same treatment as name.

Here's how we'd do that:
<!-- prettier-ignore-start -->
```typescript
export class Person extends Model {
  @property public name: string;
  @property @mock("name") public fathersName: string;
}
```
<!-- prettier-ignore-end -->
with this simple addition you've told the mocking engine that the property `fathersName` should be treated as a name. Pretty cool right?

So the obvious next question is ... what named properties are there? Glad you're there keeping me honest. So the answer is:

- name
  - firstName
  - lastName
- company
- address
  - streetName
  - streetAddress
  - city
  - county
  - state
  - stateAbbr
  - country
  - countryCode
- latitude
- longitude
- gender
- date (alias for `dateRecent`)
  - datePast
  - dateFuture
  - dateRecent
  - dateSoon
- image (alias for `avatar`)
  - avatar
  - imageAnimal
  - imagePerson
  - imageNature
  - imageTransport
- phoneNumber

All you need to do is choose any of the above and add the `@mock([named tag])` as a modifier to the property.

## Bespoke Handling

The named contexts should take you a long way but sometimes not to the finish line. In these situations you can drop out of "configuration" and into code:

<!-- prettier-ignore-start -->
```typescript
const myBespokeHandler: IMockContext = (context) => {
  return context.faker.
}

export class Person extends Model {
  @property public name: string;
  @property @mock(myBespokeHandler) public fathersName: string;
}
```
<!-- prettier-ignore-end -->
