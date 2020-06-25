import { ICompositeKey } from "../private";
/**
   * **_reduceCompositeNotationToStringRepresentation**
   *
   * Reduces a `ICompositeKey` hash into string representation of the form:
   *
```typescript
`${id}::${prop}:${propValue}::${prop2}:${propValue2}`
```
   */
export declare function reduceCompositeNotationToStringRepresentation(ck: ICompositeKey): string;
