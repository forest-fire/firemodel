import { ICompositeKey } from "@/types";

/**
   * **_reduceCompositeNotationToStringRepresentation**
   *
   * Reduces a `ICompositeKey` hash into string representation of the form:
   *
```typescript
`${id}::${prop}:${propValue}::${prop2}:${propValue2}`
```
   */
export function reduceCompositeNotationToStringRepresentation(
  ck: ICompositeKey
): string {
  return (
    `${ck.id}` +
    Object.keys(ck)
      .filter((k) => k !== "id")
      .map((k) => `::${k}:${ck[k]}`)
  );
}
