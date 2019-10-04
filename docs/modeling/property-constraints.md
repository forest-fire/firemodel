---
sidebarDepth: 3
---
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

1. **Properties** - each property is defined as a `public` member of the class, given a type (via TypeScript grammar), and denoted as a property with the `@property` decorator.
2. **Constraints** - all other decorators attached to the property are there to associate additional meta-information about the property for your run-time environment to respond to.

## Categories

While there aren't stark differences in behavior between these constraints it might be worthwhile drawing up some categories:

### Responsive Meta

This cateogory is meta-information which **Firemodel** not only stores but also behaviorly responds to.

- The `@mock` decorator allows for detailed meta-characteristics of your data to be stored in your models and then _mocked_ whenever you need them. See the [mocking](/mocking/) section for more  details.
- The `@defaultValue` decorator allows you to state values for some of your model's properties to take on if they are not specified. Unlike the _mock_ these values are not used for testing purposes but rather for real life defaults. This allows your models to initialize into a known  state without requiring the caller to state every required property any time they are adding/creating a new record.

     ```typescript
     export FooBar extends Model {
       @property @defaultValue("USA") country: string;
     }
     ```

- The `@pushKey` decorator tells **firemodel** that the given property is a dictionary/hash which conforms to Firebase's normal "array representation" (aka, a *dictionary* whose keys are Firebase generated keys derived from the Firebase `push` function). This is very useful when you have multiple clients who might be pushing content to the same "firebase array" because using the Firebase `push` operation ensures that any and all updates are serialized and that the new keys have a natural sort order based on time that they were received (many people don't know that embedded into the Firebase key is a precise datetime stamp which measures down to the milisecond)

### **Built-in Meta**

These constraints are built into **Firemodel** "out of the box" and therefore immediately available to your code as in _import_ but they are not enforced by FireModel. The enforcement is left to you in your implementation.

Examples are `min`, `max`, `length`, and `desc`. For instance, to get the minimum age in our `Person` example above:

```typescript
if(age > person.META.property('age').min) { ... }
```

### Your Meta

The final category of property meta is that which you add yourself. This can be done one of two ways:

- there is a built-in decorator called `@constrain(prop: string, value: any)` which lets you associate any name/value pair with a property.
- you can also add your own decorator by creating something like this:

```typescript
import {propertyDecorator} from 'firemodel';
export function foobar(value: any) {
  return propertyDecorator({ foobar: value });
}
```
