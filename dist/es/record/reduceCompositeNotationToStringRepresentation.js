/**
   * **_reduceCompositeNotationToStringRepresentation**
   *
   * Reduces a `ICompositeKey` hash into string representation of the form:
   *
```typescript
`${id}::${prop}:${propValue}::${prop2}:${propValue2}`
```
   */
export function reduceCompositeNotationToStringRepresentation(ck) {
    return (`${ck.id}` +
        Object.keys(ck)
            .filter(k => k !== "id")
            .map(k => `::${k}:${ck[k]}`));
}
//# sourceMappingURL=reduceCompositeNotationToStringRepresentation.js.map