# Property Constraints

## Intro

<!-- prettier-ignore-start -->
```typescript
@model()
export class Person extends Model {
  @property @mock('name') public name: string;
  @property @min(1) @max(50) public age: number;
  @property @length(250) public bio: string;
  @property public gender?: "male" | "female" | "other";
}
```
<!-- prettier-ignore-stop -->

Now we turn our attention to providing meta-information to the individual properties. There are two aspects to focus on:

1. **Properties** - each property is defined as a `public` member of the class, given a type (via TypeScript grammer), and denoted as a property with the `@property` decorator.
2. **Constraints** - all other decorators attached to the property are there to associate additional meta-information about the property for your run-time environment to respond to.

## Categories

While there aren't stark differences in behavior between these constraints it might be worthwhile drawing up some categories:

1. **Responsive Meta** - this cateogory would be meta-information in which **FireModel** not only stores meta information but also responds based on the decorator.

   - The `@mock` decorator allows for detailed meta-characteristics of your data to be stored in your models and then _mocked_ whenever you need them. See the [mocking](/mocking/) section for more  details.
   - The `@defaultValue` decorator allows you to state values for some of your model's properties to take on if they are not specified. Unlike the _mock_ these values are not used for testing purposes but rather for real life defaults. This allows your models to initialize into a known  state without requiring the caller to state every required property any time they are adding/creating a new record.

2. **Built-in Meta** - the remaining constraints that are built in to **FireModel** "out of the box" are `min`, `max`, `length`, and `desc`. These properties are available to your code and you'll find them quite easily as the typing is included to ensure these properties are exposed via your editor's autocomplete. For instance, to get the minimum age in our `Person` example above:

    ```typescript
    if(age > person.META.property('age').min) { ... }
    ```

3. **Your Meta** - you can add your own meta data too through one of two ways:

    - there is a built-in decorator called `@constrain(prop: string, value: any)` which lets you associate any name/value pair with a property.
    - you can also add your own decorator by creating something like this: 

    ```typescript
    import {propertyDecorator} from 'firemodel';
    export function foobar(value: any) {
      return propertyDecorator({ foobar: value });
    }
    ```

Ok, that's it for properties for now. Let's move onto relationships ...
